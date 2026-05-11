const cheerio = require('cheerio');
const { parsePrice } = require('../utils/normalize');
const { fetchHtml, extractFromJsonLd, extractFromNextData, projectDiagnostics, dedupeByKey } = require('../utils/extractors');

async function scrapeVivanuncios(source) {
  let html = '';

  try {
    html = await fetchHtml(source.url);
    const $ = cheerio.load(html);
    const proyectos = [];
    const selectors = ['.tileV1', '[data-testid="listing-ad-card"]', '.listing-card'];
    const selectorHits = {};

    selectors.forEach((selector) => {
      selectorHits[selector] = $(selector).length;
      $(selector).each((_, element) => {
        const nombre = $(element).find('.item-title, [data-testid="ad-title"], h2').first().text().trim();
        const precioTexto = $(element).find('.ad-price, [data-testid="ad-price"], .price').first().text().trim();
        const ubicacion = $(element).find('.item-location, [data-testid="location-text"], .location').first().text().trim();
        const descripcion = $(element).find('.item-description, [data-testid="ad-description"], p').first().text().trim();
        const relativeLink = $(element).find('a').first().attr('href');

        const precio = parsePrice(precioTexto);
        if (!precio) return;

        const min = source.filters?.precioMin || 0;
        const max = source.filters?.precioMax || Number.MAX_SAFE_INTEGER;
        if (precio < min || precio > max) return;

        const link = relativeLink
          ? (relativeLink.startsWith('http') ? relativeLink : `https://www.vivanuncios.com.mx${relativeLink}`)
          : '';

        proyectos.push({
          nombre,
          precio,
          precioTexto,
          ubicacion,
          descripcion,
          link,
          tipo: source.type,
          estado: 'disponible'
        });
      });
    });

    const jsonLdResults = extractFromJsonLd($, source);
    const nextDataResults = extractFromNextData($, source);
    const merged = dedupeByKey([...proyectos, ...jsonLdResults, ...nextDataResults]);

    return {
      items: merged,
      diagnostics: projectDiagnostics({
        html,
        selectorHits,
        selectorUsed: selectors,
        jsonLdCount: jsonLdResults.length,
        nextDataCount: nextDataResults.length,
        resultCount: merged.length,
        sourceId: source.id
      })
    };
  } catch (error) {
    return {
      items: [],
      diagnostics: {
        sourceId: source.id,
        error: error.message,
        htmlLength: html.length,
        resultCount: 0
      }
    };
  }
}

module.exports = { scrapeVivanuncios };
