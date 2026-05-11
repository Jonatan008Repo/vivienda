require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:3000'
}));
app.use(express.json());

// Conectar a MongoDB
connectDB();

// Rutas
app.use('/api/proyectos', require('./routes/proyectos'));
app.use('/api/agent', require('./routes/agent'));

// Health check
app.get('/', (req, res) => {
  res.json({
    message: '🏠 API Agente Vivienda Puebla - Activa',
    version: '1.0.0',
    endpoints: {
      proyectos: '/api/proyectos',
      agent: 'POST /api/agent/run',
      agentDiagnostics: 'GET /api/agent/diagnostics',
      docs: 'GET /api/proyectos | GET /api/proyectos/:id | POST /api/proyectos | PUT /api/proyectos/:id | DELETE /api/proyectos/:id'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Ambiente: ${process.env.NODE_ENV}`);
});
