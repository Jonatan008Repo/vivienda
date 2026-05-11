const mongoose = require('mongoose');

const CoordenadasSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
}, { _id: false });

const ProyectoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  tipo: {
    type: String,
    required: true,
    enum: ['programa_gobierno', 'desarrollo_nuevo', 'reventa_infonavit']
  },
  precio: { type: Number, required: true, min: 0 },
  ubicacion: { type: String, required: true, trim: true },
  coordenadas: { type: CoordenadasSchema, required: true },
  desarrolladora: { type: String, trim: true },
  recamaras: { type: Number, min: 0 },
  banos: { type: Number, min: 0 },
  m2Construccion: { type: Number, min: 0 },
  m2Terreno: { type: Number, min: 0 },
  estado: {
    type: String,
    enum: ['disponible', 'vendido', 'por_iniciar', 'por_anunciar'],
    default: 'disponible'
  },
  entrega: { type: String, trim: true },
  plusvaliaEsperada: { type: String, trim: true },
  mensualidadEstimada: { type: Number, min: 0 },
  caracteristicas: [{ type: String, trim: true }],
  ventajas: [{ type: String, trim: true }],
  desventajas: [{ type: String, trim: true }],
  descripcion: { type: String, trim: true },
  precioTexto: { type: String, trim: true },
  link: { type: String, trim: true },
  puntuacion: { type: Number, min: 0, max: 10 },
  contacto: { type: String, trim: true },

  // Metadata de scraping (opcionales)
  fuente: { type: String, trim: true, index: true },
  fuenteNombre: { type: String, trim: true },
  fechaScraped: { type: Date, index: true },
  hash: { type: String, trim: true, unique: true, sparse: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Proyecto', ProyectoSchema);
