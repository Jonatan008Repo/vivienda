const cheerio = require('cheerio');
const { parsePrice } = require('../utils/normalize');
const { fetchHtml, extractFromJsonLd, extractFromNextData, projectDiagnostics, dedupeByKey } = require('../utils/extractors');

async function scrapeInmuebles24(source) {
  let html = '';

  try {
    html = await fetchHtml(source.url);
    const $ = cheerio.load(html);
    const proyectos = [];
    const selectors = ['.postingCard', '.posting-card', '[data-qa="posting-card"]'];
    const selectorHits = {};

    selectors.forEach((selector) => {
      selectorHits[selector] = $(selector).length;
      $(selector).each((_, element) => {
        const nombre = $(element).find('.postingCardTitle, .posting-title, [data-qa="postingPropertyTitle"]').first().text().trim();
        const precioTexto = $(element).find('.postingPrices-module__price, .price, [data-qa="postingPrice"]').first().text().trim();
        const ubicacion = $(element).find('.postingLocations-module__location-text, .posting-location, [data-qa="postingLocation"]').first().text().trim();
        const descripcion = $(element).find('.postingCardDescription, [data-qa="postingDescription"]').first().text().trim();
        const relativeLink = $(element).find('a').first().attr('href');

        const precio = parsePrice(precioTexto);
        if (!precio) return;

        const min = source.filters?.precioMin || 0;
        const max = source.filters?.precioMax || Number.MAX_SAFE_INTEGER;
        if (precio < min || precio > max) return;

        const link = relativeLink
          ? (relativeLink.startsWith('http') ? relativeLink : `https://www.inmuebles24.com${relativeLink}`)
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

module.exports = { scrapeInmuebles24 };
