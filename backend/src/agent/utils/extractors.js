const axios = require('axios');
const cheerio = require('cheerio');
const { parsePrice, sanitizeString } = require('./normalize');

function getHeaders() {
  return {
    'User-Agent': process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    Accept: 'text/html,application/xhtml+xml'
  };
}

async function fetchHtml(url) {
  try {
    const response = await axios.get(url, {
      headers: getHeaders(),
      timeout: 30000
    });

    return response.data;
  } catch (error) {
    // Fallback de solo lectura cuando la fuente bloquea bots (403)
    if (error.response?.status === 403) {
      const mirrorUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`;
      const mirrorResponse = await axios.get(mirrorUrl, {
        headers: getHeaders(),
        timeout: 30000
      });
      return mirrorResponse.data;
    }

    throw error;
  }
}

function extractFromJsonLd($, source) {
  const items = [];

  $('script[type="application/ld+json"]').each((_, script) => {
    const raw = $(script).html();
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      flattenJsonLd(parsed).forEach((node) => {
        if (!node || typeof node !== 'object') return;

        const type = sanitizeString(node['@type']).toLowerCase();
        const candidateTypes = ['offer', 'product', 'residence', 'house', 'singlefamilyresidence', 'apartment'];
        if (!candidateTypes.some((t) => type.includes(t))) return;

        const name = sanitizeString(node.name || node.alternateName || node.headline);
        const offer = Array.isArray(node.offers) ? node.offers[0] : node.offers;
        const priceValue = offer?.price || node.price;
        const priceText = sanitizeString(priceValue);
        const price = Number(priceValue) || parsePrice(priceText);

        const addressNode = node.address || node.location?.address || {};
        const addressText = [
          sanitizeString(addressNode.streetAddress),
          sanitizeString(addressNode.addressLocality),
          sanitizeString(addressNode.addressRegion),
          sanitizeString(addressNode.addressCountry)
        ].filter(Boolean).join(', ');

        const link = sanitizeString(node.url || node.mainEntityOfPage?.['@id'] || offer?.url);
        const description = sanitizeString(node.description || node.disambiguatingDescription);

        if (!price || !name) return;

        const min = source.filters?.precioMin || 0;
        const max = source.filters?.precioMax || Number.MAX_SAFE_INTEGER;
        if (price < min || price > max) return;

        items.push({
          nombre: name,
          precio: price,
          precioTexto: priceText,
          ubicacion: addressText || 'Puebla',
          descripcion: description,
          link,
          tipo: source.type,
          estado: 'disponible'
        });
      });
    } catch (_) {
      // Script JSON-LD invalido, se ignora
    }
  });

  return dedupeByKey(items);
}

function flattenJsonLd(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.flatMap(flattenJsonLd);

  const graph = input['@graph'];
  if (Array.isArray(graph)) return graph.flatMap(flattenJsonLd);

  return [input];
}

function dedupeByKey(items) {
  const seen = new Set();
  const out = [];

  for (const item of items) {
    const key = `${sanitizeString(item.nombre).toLowerCase()}|${Number(item.precio) || 0}|${sanitizeString(item.ubicacion).toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

function extractFromNextData($, source) {
  const out = [];
  const script = $('#__NEXT_DATA__').html();
  if (!script) return out;

  try {
    const parsed = JSON.parse(script);
    walkObject(parsed, (node) => {
      if (!node || typeof node !== 'object') return;

      const title = sanitizeString(node.title || node.name || node.propertyTitle || node.headline);
      const priceCandidate = node.price || node.amount || node.value || node.offerPrice;
      const priceText = sanitizeString(priceCandidate || node.priceText);
      const price = Number(priceCandidate) || parsePrice(priceText);
      const location = sanitizeString(node.location || node.address || node.city || node.zone || node.neighborhood);
      const link = sanitizeString(node.url || node.href || node.permalink);
      const description = sanitizeString(node.description || node.summary);

      if (!title || !price) return;

      const min = source.filters?.precioMin || 0;
      const max = source.filters?.precioMax || Number.MAX_SAFE_INTEGER;
      if (price < min || price > max) return;

      out.push({
        nombre: title,
        precio: price,
        precioTexto: priceText,
        ubicacion: location || 'Puebla',
        descripcion,
        link,
        tipo: source.type,
        estado: 'disponible'
      });
    });
  } catch (_) {
    return [];
  }

  return dedupeByKey(out);
}

function walkObject(input, visitor) {
  if (!input || typeof input !== 'object') return;
  visitor(input);

  if (Array.isArray(input)) {
    input.forEach((item) => walkObject(item, visitor));
    return;
  }

  Object.values(input).forEach((value) => walkObject(value, visitor));
}

function projectDiagnostics({ html, selectorHits, selectorUsed, jsonLdCount, resultCount, sourceId }) {
  const htmlLength = typeof html === 'object' ? html.length : (html ? html.length : 0);
  return {
    sourceId,
    htmlLength,
    selectorUsed,
    selectorHits,
    jsonLdCount,
    resultCount
  };
}

module.exports = {
  fetchHtml,
  extractFromJsonLd,
  extractFromNextData,
  projectDiagnostics,
  dedupeByKey
};
