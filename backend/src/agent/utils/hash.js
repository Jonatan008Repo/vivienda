const crypto = require('crypto');

function buildProjectHash({ nombre, precio, ubicacion }) {
  const key = `${String(nombre || '').trim().toLowerCase()}|${Number(precio) || 0}|${String(ubicacion || '').trim().toLowerCase()}`;
  return crypto.createHash('md5').update(key).digest('hex');
}

module.exports = { buildProjectHash };
