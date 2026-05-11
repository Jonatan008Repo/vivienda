const cheerio = require('cheerio');
const { parsePrice } = require('../utils/normalize');
const { fetchHtml, extractFromJsonLd, extractFromNextData, projectDiagnostics, dedupeByKey } = require('../utils/extractors');

const SELECTORS = [
  '.snippet.js-snippet.normal',
  '.snippet[data-test="normal-listing"]',
  '#listings-content .snippet'
];

function buildPageUrl(baseUrl, page) {
  if (page <= 1) return baseUrl;
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}page=${page}`;
}

function extractFromPage($, source) {
  const proyectos = [];
  const selectorHits = {};
  const min = source.filters?.precioMin || 0;
  const max = source.filters?.precioMax || Number.MAX_SAFE_INTEGER;

  SELECTORS.forEach((selector) => {
    selectorHits[selector] = $(selector).length;
    $(selector).each((_, element) => {
      const nombre = $(element)
        .find('.snippet__content__title, [data-test="snippet-title"], h2')
        .first()
        .text()
        .trim();

      const precioTexto = $(element)
        .find('.snippet__content__price, .price, [data-test="snippet-price"]')
        .first()
        .text()
        .replace(/\s+/g, ' ')
        .trim();

      // Descartar precios en USD o en renta (/mes)
      if (/USD|\$/i.test(precioTexto) && /\/mes/i.test(precioTexto)) return;
      if (/\/mes/i.test(precioTexto)) return;

      const ubicacion = $(element)
        .find('.snippet__content__location span, .snippet__content__location, [data-test="snippet-location"]')
        .first()
        .text()
        .trim();

      const descripcion = $(element)
        .find('.snippet__content__description, [data-test="snippet-description"], p')
        .first()
        .text()
        .trim();

      const relativeLink =
        $(element).find('a[href*="/detalle/"]').first().attr('href') ||
        $(element).find('a').first().attr('href');

      const precio = parsePrice(precioTexto);
      if (!precio || !nombre) return;
      if (precio < min || precio > max) return;

      const link = relativeLink
        ? (relativeLink.startsWith('http') ? relativeLink : `https://www.lamudi.com.mx${relativeLink}`)
        : '';

      proyectos.push({
        nombre,
        precio,
        precioTexto,
        ubicacion: ubicacion || 'Puebla',
        descripcion,
        link,
        tipo: source.type,
        estado: 'disponible'
      });
    });
  });

  return { proyectos, selectorHits };
}

async function scrapeLamudi(source) {
  const totalPages = source.pages || 1;
  const allProyectos = [];
  const allSelectorHits = {};
  let lastHtmlLength = 0;
  let totalJsonLd = 0;
  let totalNextData = 0;

  for (let page = 1; page <= totalPages; page++) {
    let html = '';
    try {
      const url = buildPageUrl(source.url, page);
      html = await fetchHtml(url);
      lastHtmlLength = html.length;
      const $ = cheerio.load(html);

      const { proyectos, selectorHits } = extractFromPage($, source);
      allProyectos.push(...proyectos);

      for (const [sel, count] of Object.entries(selectorHits)) {
        allSelectorHits[sel] = (allSelectorHits[sel] || 0) + count;
      }

      const jsonLdResults = extractFromJsonLd($, source);
      const nextDataResults = extractFromNextData($, source);
      totalJsonLd += jsonLdResults.length;
      totalNextData += nextDataResults.length;
      allProyectos.push(...jsonLdResults, ...nextDataResults);

      // Si no hay snippets en esta página, no seguir paginando
      const hasSnippets = Object.values(selectorHits).some((n) => n > 0);
      if (!hasSnippets) break;
    } catch (error) {
      // Página falló, detenemos paginación
      break;
    }
  }

  const merged = dedupeByKey(allProyectos);

  return {
    items: merged,
    diagnostics: projectDiagnostics({
      html: { length: lastHtmlLength },
      selectorHits: allSelectorHits,
      selectorUsed: SELECTORS,
      jsonLdCount: totalJsonLd,
      nextDataCount: totalNextData,
      resultCount: merged.length,
      sourceId: source.id
    })
  };
}

module.exports = { scrapeLamudi };
