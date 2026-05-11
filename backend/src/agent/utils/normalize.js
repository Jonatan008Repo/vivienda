const DEFAULT_COORDS = { lat: 19.0414, lng: -98.2063 };
const ALLOWED_TYPES = new Set(['programa_gobierno', 'desarrollo_nuevo', 'reventa_infonavit']);
const ALLOWED_ESTADOS = new Set(['disponible', 'vendido', 'por_iniciar', 'por_anunciar']);

function parsePrice(raw) {
  if (!raw) return null;
  const cleaned = String(raw).replace(/[^\d.,]/g, '').replace(/,/g, '');
  const numeric = Number(cleaned);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return Math.round(numeric);
}

function sanitizeString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value).trim() || fallback;
}

function clampBedrooms(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 2;
  return parsed;
}

function clampBathrooms(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 1;
  return parsed;
}

function normalizeTipo(value, fallback = 'desarrollo_nuevo') {
  return ALLOWED_TYPES.has(value) ? value : fallback;
}

function normalizeEstado(value, fallback = 'disponible') {
  return ALLOWED_ESTADOS.has(value) ? value : fallback;
}

function normalizeProyecto(raw, source) {
  const precio = Number(raw.precio) || parsePrice(raw.precioTexto);
  const nombre = sanitizeString(raw.nombre, 'Propiedad en venta');
  const ubicacion = sanitizeString(raw.ubicacion, 'Puebla');

  if (!precio || precio < 100000 || precio > 3000000) {
    return null;
  }

  return {
    nombre,
    tipo: normalizeTipo(raw.tipo, source.type || 'desarrollo_nuevo'),
    precio,
    precioTexto: sanitizeString(raw.precioTexto),
    ubicacion,
    coordenadas: raw.coordenadas || DEFAULT_COORDS,
    desarrolladora: sanitizeString(raw.desarrolladora, source.name),
    recamaras: clampBedrooms(raw.recamaras),
    banos: clampBathrooms(raw.banos),
    m2Construccion: Number(raw.m2Construccion) || undefined,
    m2Terreno: Number(raw.m2Terreno) || undefined,
    estado: normalizeEstado(raw.estado, 'disponible'),
    entrega: sanitizeString(raw.entrega),
    plusvaliaEsperada: sanitizeString(raw.plusvaliaEsperada),
    mensualidadEstimada: Number(raw.mensualidadEstimada) || undefined,
    caracteristicas: Array.isArray(raw.caracteristicas) ? raw.caracteristicas : [],
    ventajas: Array.isArray(raw.ventajas) ? raw.ventajas : [],
    desventajas: Array.isArray(raw.desventajas) ? raw.desventajas : [],
    descripcion: sanitizeString(raw.descripcion),
    link: sanitizeString(raw.link),
    puntuacion: Number(raw.puntuacion) || 5,
    contacto: sanitizeString(raw.contacto),
    fuente: source.id,
    fuenteNombre: source.name,
    fechaScraped: new Date()
  };
}

module.exports = {
  normalizeProyecto,
  parsePrice,
  sanitizeString
};
