const Proyecto = require('../../models/Proyecto');
const sources = require('./config/sources');
const scrapers = require('./scrapers');
const { normalizeProyecto } = require('./utils/normalize');
const { buildProjectHash } = require('./utils/hash');

async function runOnce({ trigger = 'manual', dryRun = false, onlySource = null } = {}) {
  const start = Date.now();
  const stats = {
    trigger,
    dryRun,
    totalFuentes: 0,
    totalExtraidos: 0,
    nuevos: 0,
    actualizados: 0,
    invalidados: 0,
    errores: 0,
    fuentes: []
  };

  const enabledSources = sources.filter((s) => s.enabled && (!onlySource || s.id === onlySource));
  stats.totalFuentes = enabledSources.length;

  for (const source of enabledSources) {
    const scraper = scrapers[source.scraper];
    const sourceStat = {
      id: source.id,
      nombre: source.name,
      extraidos: 0,
      nuevos: 0,
      actualizados: 0,
      invalidados: 0,
      errores: 0,
      diagnostics: null
    };

    if (!scraper) {
      sourceStat.errores += 1;
      stats.errores += 1;
      stats.fuentes.push(sourceStat);
      continue;
    }

    try {
      const scrapeResult = await scraper(source);
      const extraidos = Array.isArray(scrapeResult) ? scrapeResult : (scrapeResult?.items || []);
      sourceStat.diagnostics = scrapeResult?.diagnostics || null;
      sourceStat.extraidos = extraidos.length;
      stats.totalExtraidos += extraidos.length;

      for (const raw of extraidos) {
        const normalized = normalizeProyecto(raw, source);
        if (!normalized) {
          sourceStat.invalidados += 1;
          stats.invalidados += 1;
          continue;
        }

        if (dryRun) {
          continue;
        }

        normalized.hash = buildProjectHash(normalized);

        const updateResult = await Proyecto.findOneAndUpdate(
          { hash: normalized.hash },
          {
            $set: normalized
          },
          { new: true, upsert: true, rawResult: true }
        );

        if (updateResult?.lastErrorObject?.updatedExisting === false) {
          sourceStat.nuevos += 1;
          stats.nuevos += 1;
        } else {
          sourceStat.actualizados += 1;
          stats.actualizados += 1;
        }
      }
    } catch (error) {
      sourceStat.errores += 1;
      stats.errores += 1;
    }

    stats.fuentes.push(sourceStat);
  }

  stats.duracionMs = Date.now() - start;
  return stats;
}

module.exports = { runOnce };
