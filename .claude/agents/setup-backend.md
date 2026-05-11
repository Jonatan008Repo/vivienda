# setup-backend

Agente especializado en crear el backend completo (Nivel 3) para el Agente Vivienda Puebla.

## Purpose

Implementa la arquitectura full-stack completa según `GUIA_PROYECTO_COMPLETO.md`:
- Node.js + Express server
- MongoDB (Atlas o local)
- API REST para proyectos
- Autenticación JWT (opcional)
- Modelos Mongoose
- Rutas CRUD completas

## Architecture

```
vivienda/
├── frontend/                   # React app (migrado)
│   └── agente-vivienda-puebla/
└── backend/                    # Nuevo servidor Node.js
    ├── models/
    │   ├── Proyecto.js         # Schema de MongoDB
    │   └── Usuario.js          # (Opcional) Autenticación
    ├── routes/
    │   ├── proyectos.js        # CRUD endpoints
    │   └── usuarios.js         # (Opcional) Auth
    ├── middleware/
    │   └── auth.js             # (Opcional) JWT validation
    ├── config/
    │   └── db.js               # MongoDB connection
    ├── .env                    # Variables de entorno
    ├── server.js               # Entry point
    └── package.json
```

## Implementation Steps

### Fase 1: Setup Inicial (5 min)

1. **Crear estructura backend:**
```bash
mkdir backend
cd backend
npm init -y
```

2. **Instalar dependencias:**
```bash
npm install express mongoose cors dotenv
npm install --save-dev nodemon
```

3. **Configurar scripts en package.json:**
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### Fase 2: MongoDB Connection (5 min)

1. **Crear cuenta MongoDB Atlas** (si no existe):
   - https://www.mongodb.com/cloud/atlas
   - Cluster Free Tier (M0)
   - Whitelist IP: 0.0.0.0/0 (desarrollo)
   - Crear usuario de base de datos

2. **Archivo `.env`:**
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/vivienda-puebla
PORT=5000
NODE_ENV=development
JWT_SECRET=tu_secreto_super_seguro_123
```

3. **Archivo `config/db.js`:**
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error('❌ Error MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Fase 3: Modelo Proyecto (10 min)

**Archivo `models/Proyecto.js`:**
```javascript
const mongoose = require('mongoose');

const ProyectoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tipo: {
    type: String,
    required: true,
    enum: ['programa_gobierno', 'desarrollo_nuevo', 'reventa_infonavit']
  },
  precio: { type: Number, required: true },
  ubicacion: { type: String, required: true },
  coordenadas: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  desarrolladora: String,
  recamaras: Number,
  banos: Number,
  m2Construccion: Number,
  m2Terreno: Number,
  estado: {
    type: String,
    enum: ['disponible', 'vendido', 'por_iniciar', 'por_anunciar']
  },
  entrega: String,
  plusvaliaEsperada: String,
  mensualidadEstimada: Number,
  caracteristicas: [String],
  ventajas: [String],
  desventajas: [String],
  puntuacion: Number,
  contacto: String,
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Proyecto', ProyectoSchema);
```

### Fase 4: Rutas API (15 min)

**Archivo `routes/proyectos.js`:**
```javascript
const router = require('express').Router();
const Proyecto = require('../models/Proyecto');

// GET /api/proyectos - Listar todos con filtros
router.get('/', async (req, res) => {
  try {
    const { precioMin, precioMax, tipo, recamaras, estado } = req.query;
    let query = {};

    if (precioMin || precioMax) {
      query.precio = {};
      if (precioMin) query.precio.$gte = Number(precioMin);
      if (precioMax) query.precio.$lte = Number(precioMax);
    }
    if (tipo) query.tipo = tipo;
    if (recamaras) query.recamaras = Number(recamaras);
    if (estado) query.estado = estado;

    const proyectos = await Proyecto.find(query).sort({ puntuacion: -1 });
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/proyectos/:id - Obtener uno
router.get('/:id', async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id);
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(proyecto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/proyectos - Crear nuevo
router.post('/', async (req, res) => {
  try {
    const proyecto = new Proyecto(req.body);
    await proyecto.save();
    res.status(201).json(proyecto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/proyectos/:id - Actualizar
router.put('/:id', async (req, res) => {
  try {
    const proyecto = await Proyecto.findByIdAndUpdate(
      req.params.id,
      { ...req.body, fechaActualizacion: Date.now() },
      { new: true, runValidators: true }
    );
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(proyecto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/proyectos/:id - Eliminar
router.delete('/:id', async (req, res) => {
  try {
    const proyecto = await Proyecto.findByIdAndDelete(req.params.id);
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json({ message: 'Proyecto eliminado', proyecto });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/proyectos/health - Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

module.exports = router;
```

### Fase 5: Server Principal (5 min)

**Archivo `server.js`:**
```javascript
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conectar DB
connectDB();

// Rutas
app.use('/api/proyectos', require('./routes/proyectos'));

// Health check raíz
app.get('/', (req, res) => {
  res.json({ message: 'API Vivienda Puebla activa' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
```

### Fase 6: Migrar Datos Existentes (10 min)

**Script `scripts/migrate-data.js`:**
```javascript
const mongoose = require('mongoose');
const Proyecto = require('../models/Proyecto');
require('dotenv').config();

// Copiar PROYECTOS_DATABASE del frontend
const proyectosIniciales = [
  // ... pegar los 8 proyectos existentes
];

const migrarDatos = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  console.log('Limpiando base de datos...');
  await Proyecto.deleteMany({});

  console.log('Insertando 8 proyectos iniciales...');
  await Proyecto.insertMany(proyectosIniciales);

  console.log('✅ Migración completada');
  process.exit(0);
};

migrarDatos().catch(console.error);
```

Ejecutar:
```bash
node scripts/migrate-data.js
```

### Fase 7: Modificar Frontend (15 min)

1. **Instalar axios:**
```bash
cd ../agente-vivienda-puebla
npm install axios
```

2. **Crear servicio API (`src/services/api.js`):**
```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const proyectosAPI = {
  getAll: (filtros) => api.get('/proyectos', { params: filtros }),
  getById: (id) => api.get(`/proyectos/${id}`),
  create: (data) => api.post('/proyectos', data),
  update: (id, data) => api.put(`/proyectos/${id}`, data),
  delete: (id) => api.delete(`/proyectos/${id}`)
};

export default api;
```

3. **Modificar App.js:**
```javascript
import { useState, useEffect, useMemo } from 'react';
import { proyectosAPI } from './services/api';

// ELIMINAR: const PROYECTOS_DATABASE = [...]

function App() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar proyectos desde API
  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const response = await proyectosAPI.getAll();
        setProyectos(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProyectos();
  }, []);

  if (loading) return <div>Cargando proyectos...</div>;
  if (error) return <div>Error: {error}</div>;

  // ... resto del componente usa 'proyectos' en lugar de PROYECTOS_DATABASE
}
```

## Testing

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd agente-vivienda-puebla
npm start

# Terminal 3: Pruebas
curl http://localhost:5000/api/proyectos
curl http://localhost:3000
```

## Verification Checklist

- [ ] Backend corriendo en puerto 5000
- [ ] MongoDB conectado (ver logs)
- [ ] GET /api/proyectos retorna 8 proyectos
- [ ] Frontend carga proyectos desde API
- [ ] Filtros funcionan (query params)
- [ ] Crear proyecto funciona (POST)
- [ ] No hay errores CORS

## Next Steps

Después de setup exitoso:
1. Usar `/agent add-housing-project` para agregar proyectos vía API
2. Implementar autenticación (opcional - Nivel 3 avanzado)
3. Deploy a producción (Nivel 4)

## Troubleshooting

**Error: ECONNREFUSED**
→ Backend no está corriendo. Ejecutar `cd backend && npm run dev`

**Error: MongooseError**
→ Verificar MONGODB_URI en .env

**Error: CORS**
→ Verificar que cors() esté configurado en server.js

**Frontend muestra datos viejos**
→ Eliminar PROYECTOS_DATABASE y usar useState vacío inicialmente
