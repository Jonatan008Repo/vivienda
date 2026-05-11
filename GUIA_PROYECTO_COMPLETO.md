# GUÍA: Transformar el Agente de Vivienda en un Proyecto Completo

## NIVEL 1: Proyecto React básico (Local)
**Tiempo:** 15-30 minutos  
**Conocimientos:** Básicos de React  
**Resultado:** Aplicación React local funcional

### Paso 1: Instalar Node.js
```bash
# Descarga e instala Node.js desde https://nodejs.org/
# Verifica la instalación:
node --version
npm --version
```

### Paso 2: Crear proyecto React
```bash
# Opción A: Con Vite (más rápido, recomendado)
npm create vite@latest agente-vivienda-puebla -- --template react
cd agente-vivienda-puebla
npm install

# Opción B: Con Create React App
npx create-react-app agente-vivienda-puebla
cd agente-vivienda-puebla
```

### Paso 3: Instalar dependencias necesarias
```bash
npm install lucide-react
```

### Paso 4: Reemplazar el código
1. Abre el archivo `src/App.jsx`
2. Borra todo el contenido
3. Copia y pega el código del agente que descargaste
4. Guarda el archivo

### Paso 5: Ejecutar
```bash
npm run dev
# Abre http://localhost:5173 en tu navegador
```

---

## NIVEL 2: Proyecto con funcionalidades avanzadas
**Tiempo:** 2-4 horas  
**Conocimientos:** React intermedio, APIs  
**Resultado:** App con persistencia, mapas, y más features

### Funcionalidades a agregar:

#### 1. **Persistencia de datos (LocalStorage)**
```javascript
// Guardar favoritos y comparaciones
const [favoritos, setFavoritos] = useState(() => {
  const saved = localStorage.getItem('favoritos');
  return saved ? JSON.parse(saved) : [];
});

useEffect(() => {
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
}, [favoritos]);
```

#### 2. **Sistema de alertas por email**
```bash
npm install @emailjs/browser
```

```javascript
import emailjs from '@emailjs/browser';

const crearAlerta = async (email, criterios) => {
  await emailjs.send(
    'YOUR_SERVICE_ID',
    'YOUR_TEMPLATE_ID',
    {
      user_email: email,
      precio_min: criterios.precioMin,
      precio_max: criterios.precioMax,
      ubicacion: criterios.ubicacion
    },
    'YOUR_PUBLIC_KEY'
  );
};
```

#### 3. **Integración con Google Maps**
```bash
npm install @react-google-maps/api
```

```javascript
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const MapaProyectos = ({ proyectos }) => {
  return (
    <LoadScript googleMapsApiKey="TU_API_KEY">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px' }}
        center={{ lat: 19.0414, lng: -98.2063 }}
        zoom={11}
      >
        {proyectos.map(proyecto => (
          <Marker
            key={proyecto.id}
            position={proyecto.coordenadas}
            title={proyecto.nombre}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};
```

#### 4. **Calculadora de hipoteca avanzada**
```javascript
const CalculadoraHipoteca = ({ precio }) => {
  const [enganche, setEnganche] = useState(precio * 0.1);
  const [plazo, setPlazo] = useState(20);
  const [tasa, setTasa] = useState(3.8);
  
  const calcularPago = () => {
    const principal = precio - enganche;
    const tasaMensual = tasa / 100 / 12;
    const numPagos = plazo * 12;
    
    const pago = principal * 
      (tasaMensual * Math.pow(1 + tasaMensual, numPagos)) / 
      (Math.pow(1 + tasaMensual, numPagos) - 1);
    
    return {
      mensualidad: Math.round(pago),
      totalPagar: Math.round(pago * numPagos),
      totalIntereses: Math.round((pago * numPagos) - principal)
    };
  };
  
  // ... render UI
};
```

#### 5. **Sistema de filtros geográficos**
```javascript
// Agregar filtro por distancia
const filtrarPorDistancia = (proyectos, ubicacionUsuario, radioKm) => {
  return proyectos.filter(proyecto => {
    const distancia = calcularDistancia(
      ubicacionUsuario,
      proyecto.coordenadas
    );
    return distancia <= radioKm;
  });
};

const calcularDistancia = (coord1, coord2) => {
  // Fórmula de Haversine
  const R = 6371; // Radio de la Tierra en km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * 
    Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
```

#### 6. **Exportar comparaciones a PDF**
```bash
npm install jspdf jspdf-autotable
```

```javascript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const exportarPDF = (proyectos) => {
  const doc = new jsPDF();
  
  doc.text('Comparación de Proyectos - Puebla', 14, 15);
  
  const tableData = proyectos.map(p => [
    p.nombre,
    formatPrecio(p.precio),
    p.ubicacion,
    `${p.recamaras} rec.`,
    p.plusvaliaEsperada
  ]);
  
  doc.autoTable({
    head: [['Proyecto', 'Precio', 'Ubicación', 'Recámaras', 'Plusvalía']],
    body: tableData,
    startY: 25
  });
  
  doc.save('comparacion-proyectos.pdf');
};
```

#### 7. **Notificaciones push**
```bash
npm install react-toastify
```

```javascript
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Notificar nuevo proyecto
const notificarNuevoProyecto = (proyecto) => {
  toast.success(`🏠 Nuevo proyecto disponible: ${proyecto.nombre}`, {
    position: "top-right",
    autoClose: 5000
  });
};
```

#### 8. **Sistema de usuarios básico**
```javascript
// Contexto de usuario
const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem('usuario');
    return saved ? JSON.parse(saved) : null;
  });
  
  const login = (datos) => {
    setUsuario(datos);
    localStorage.setItem('usuario', JSON.stringify(datos));
  };
  
  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
  };
  
  return (
    <UserContext.Provider value={{ usuario, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
```

---

## NIVEL 3: Aplicación Full-Stack con Backend
**Tiempo:** 1-2 semanas  
**Conocimientos:** React, Node.js, Base de datos  
**Resultado:** Aplicación completa con backend, base de datos, autenticación

### Arquitectura recomendada:

```
proyecto/
├── frontend/          # React app
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Node.js/Express
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── server.js
└── database/          # PostgreSQL/MongoDB
```

### Backend Setup (Node.js + Express)

#### 1. Inicializar backend
```bash
mkdir backend
cd backend
npm init -y
npm install express cors dotenv mongoose bcryptjs jsonwebtoken
npm install --save-dev nodemon
```

#### 2. Estructura del servidor (`server.js`)
```javascript
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexión MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Rutas
app.use('/api/proyectos', require('./routes/proyectos'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/alertas', require('./routes/alertas'));
app.use('/api/favoritos', require('./routes/favoritos'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
```

#### 3. Modelos (MongoDB Schemas)

**Modelo Proyecto:**
```javascript
// models/Proyecto.js
const mongoose = require('mongoose');

const ProyectoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tipo: { type: String, required: true },
  precio: { type: Number, required: true },
  ubicacion: { type: String, required: true },
  coordenadas: {
    lat: Number,
    lng: Number
  },
  desarrolladora: String,
  recamaras: Number,
  banos: Number,
  m2Construccion: Number,
  estado: String,
  entrega: String,
  caracteristicas: [String],
  ventajas: [String],
  desventajas: [String],
  puntuacion: Number,
  imagenes: [String],
  contacto: String,
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Proyecto', ProyectoSchema);
```

**Modelo Usuario:**
```javascript
// models/Usuario.js
const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telefono: String,
  presupuestoMin: Number,
  presupuestoMax: Number,
  preferencias: {
    recamaras: Number,
    ubicaciones: [String],
    tipoProyecto: [String]
  },
  favoritos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto' }],
  alertasActivas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Alerta' }],
  fechaRegistro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
```

**Modelo Alerta:**
```javascript
// models/Alerta.js
const mongoose = require('mongoose');

const AlertaSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  criterios: {
    precioMin: Number,
    precioMax: Number,
    ubicaciones: [String],
    tipoProyecto: [String],
    recamarasMin: Number
  },
  frecuencia: { type: String, default: 'diaria' }, // diaria, semanal, inmediata
  activa: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alerta', AlertaSchema);
```

#### 4. Rutas API

**Rutas de Proyectos:**
```javascript
// routes/proyectos.js
const router = require('express').Router();
const Proyecto = require('../models/Proyecto');

// GET todos los proyectos con filtros
router.get('/', async (req, res) => {
  try {
    const { 
      precioMin, 
      precioMax, 
      tipo, 
      ubicacion, 
      recamaras 
    } = req.query;
    
    let query = {};
    
    if (precioMin || precioMax) {
      query.precio = {};
      if (precioMin) query.precio.$gte = Number(precioMin);
      if (precioMax) query.precio.$lte = Number(precioMax);
    }
    
    if (tipo) query.tipo = tipo;
    if (recamaras) query.recamaras = Number(recamaras);
    if (ubicacion) {
      query.ubicacion = { $regex: ubicacion, $options: 'i' };
    }
    
    const proyectos = await Proyecto.find(query).sort({ puntuacion: -1 });
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET proyecto por ID
router.get('/:id', async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id);
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(proyecto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST nuevo proyecto (admin)
router.post('/', async (req, res) => {
  try {
    const proyecto = new Proyecto(req.body);
    await proyecto.save();
    res.status(201).json(proyecto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT actualizar proyecto (admin)
router.put('/:id', async (req, res) => {
  try {
    const proyecto = await Proyecto.findByIdAndUpdate(
      req.params.id,
      { ...req.body, fechaActualizacion: Date.now() },
      { new: true }
    );
    res.json(proyecto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
```

**Rutas de Usuarios:**
```javascript
// routes/usuarios.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Registro
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    
    // Verificar si existe
    const existente = await Usuario.findOne({ email });
    if (existente) {
      return res.status(400).json({ error: 'Email ya registrado' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Crear usuario
    const usuario = new Usuario({
      nombre,
      email,
      password: hashedPassword
    });
    
    await usuario.save();
    
    // Generar token
    const token = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ token, usuario: { id: usuario._id, nombre, email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }
    
    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token, usuario: { id: usuario._id, nombre: usuario.nombre, email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

#### 5. Middleware de autenticación
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado' });
  }
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Token inválido' });
  }
};
```

### Frontend: Conectar con Backend

#### 1. Configurar Axios
```bash
cd frontend
npm install axios
```

#### 2. API Service
```javascript
// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const proyectosAPI = {
  getAll: (filtros) => api.get('/proyectos', { params: filtros }),
  getById: (id) => api.get(`/proyectos/${id}`),
  create: (data) => api.post('/proyectos', data),
  update: (id, data) => api.put(`/proyectos/${id}`, data)
};

export const usuariosAPI = {
  registro: (data) => api.post('/usuarios/registro', data),
  login: (data) => api.post('/usuarios/login', data),
  getProfile: () => api.get('/usuarios/perfil')
};

export const alertasAPI = {
  create: (data) => api.post('/alertas', data),
  getAll: () => api.get('/alertas'),
  delete: (id) => api.delete(`/alertas/${id}`)
};

export default api;
```

#### 3. Hook personalizado para proyectos
```javascript
// src/hooks/useProyectos.js
import { useState, useEffect } from 'react';
import { proyectosAPI } from '../services/api';

export const useProyectos = (filtros) => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        setLoading(true);
        const response = await proyectosAPI.getAll(filtros);
        setProyectos(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProyectos();
  }, [filtros]);
  
  return { proyectos, loading, error };
};
```

### Base de datos: MongoDB Atlas (Cloud)

#### 1. Crear cuenta en MongoDB Atlas
```
1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (Free tier M0)
4. Configura acceso de red (IP Whitelist: 0.0.0.0/0 para desarrollo)
5. Crea usuario de base de datos
6. Obtén la cadena de conexión
```

#### 2. Variables de entorno
```bash
# backend/.env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/vivienda-puebla
JWT_SECRET=tu_secreto_super_seguro_aqui
PORT=5000
NODE_ENV=development
```

---

## NIVEL 4: Deploy en Producción
**Tiempo:** 2-4 horas  
**Resultado:** App en línea accesible públicamente

### Opción A: Vercel (Frontend) + Railway (Backend)

#### Frontend en Vercel:
```bash
# Instalar Vercel CLI
npm install -g vercel

# En la carpeta frontend
cd frontend
vercel login
vercel

# Configurar variables de entorno en Vercel Dashboard:
# REACT_APP_API_URL = tu-backend-url
```

#### Backend en Railway:
```
1. Ve a https://railway.app
2. Conecta tu repositorio GitHub
3. Despliega automáticamente
4. Configura variables de entorno (MONGODB_URI, JWT_SECRET)
5. Railway te da una URL pública
```

### Opción B: Todo en Heroku
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Crear app
heroku create agente-vivienda-puebla

# Configurar variables
heroku config:set MONGODB_URI=tu-uri
heroku config:set JWT_SECRET=tu-secreto

# Deploy
git push heroku main
```

### Opción C: DigitalOcean App Platform
```
1. Ve a https://www.digitalocean.com/products/app-platform
2. Conecta repositorio
3. Configura build settings:
   - Frontend: npm run build
   - Backend: node server.js
4. Agrega variables de entorno
5. Deploy automático
```

---

## FUNCIONALIDADES EXTRAS AVANZADAS

### 1. Web Scraping automático
```javascript
// Scraper para actualizar proyectos desde Infonavit
const puppeteer = require('puppeteer');

const scrapearInfonavit = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('https://infonavit.org.mx/viviendadisponible');
  
  const proyectos = await page.evaluate(() => {
    // Extraer datos de la página
    const items = document.querySelectorAll('.proyecto-item');
    return Array.from(items).map(item => ({
      nombre: item.querySelector('.nombre').textContent,
      ubicacion: item.querySelector('.ubicacion').textContent,
      // ... más campos
    }));
  });
  
  await browser.close();
  return proyectos;
};

// Ejecutar cada día con cron job
```

### 2. Análisis de plusvalía con ML
```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-node
```

```javascript
import * as tf from '@tensorflow/tfjs-node';

const predecirPlusval ia = async (proyecto) => {
  // Cargar modelo pre-entrenado
  const model = await tf.loadLayersModel('file://./modelo/model.json');
  
  // Preparar features
  const features = tf.tensor2d([[
    proyecto.precio,
    proyecto.m2Construccion,
    proyecto.coordenadas.lat,
    proyecto.coordenadas.lng
  ]]);
  
  // Predecir
  const prediccion = model.predict(features);
  return prediccion.dataSync()[0];
};
```

### 3. Chat en vivo
```bash
npm install socket.io socket.io-client
```

```javascript
// Backend
const io = require('socket.io')(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('Usuario conectado');
  
  socket.on('enviar-mensaje', (mensaje) => {
    io.emit('nuevo-mensaje', mensaje);
  });
});

// Frontend
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('nuevo-mensaje', (mensaje) => {
  // Mostrar mensaje en UI
});
```

### 4. PWA (Progressive Web App)
```bash
npm install workbox-webpack-plugin
```

```javascript
// public/manifest.json
{
  "name": "Agente Vivienda Puebla",
  "short_name": "Vivienda Puebla",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#f97316",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## CHECKLIST FINAL

### Antes de lanzar:
- [ ] Todas las rutas funcionan
- [ ] Manejo de errores implementado
- [ ] Validación de formularios
- [ ] Autenticación segura
- [ ] HTTPS configurado
- [ ] Variables de entorno protegidas
- [ ] Base de datos respaldada
- [ ] SEO optimizado (meta tags)
- [ ] Performance optimizado (lazy loading)
- [ ] Responsive en móviles
- [ ] Accesibilidad (a11y)
- [ ] Analytics configurado (Google Analytics)
- [ ] Monitoreo de errores (Sentry)
- [ ] Tests unitarios básicos
- [ ] Documentación API

### Herramientas recomendadas:
- **Diseño**: Figma
- **Gestión de proyecto**: Trello/Notion
- **Control de versiones**: GitHub
- **CI/CD**: GitHub Actions
- **Monitoreo**: Sentry, New Relic
- **Analytics**: Google Analytics, Mixpanel
- **Testing**: Jest, React Testing Library
- **Email**: SendGrid, Mailgun
- **Pagos** (futuro): Stripe, PayPal

---

## PRESUPUESTO ESTIMADO (Mensual)

### Gratis (para empezar):
- Frontend: Vercel Free
- Backend: Railway Free (500hrs)
- Base de datos: MongoDB Atlas Free (512MB)
- **Total: $0/mes**

### Producción pequeña:
- Frontend: Vercel Pro ($20)
- Backend: Railway Hobby ($5-10)
- Base de datos: MongoDB Atlas M10 ($57)
- Dominio: $10-15/año
- **Total: ~$85-95/mes**

### Producción mediana:
- Todo lo anterior: ~$95
- SendGrid (emails): $15
- Cloudinary (imágenes): $0-25
- **Total: ~$110-135/mes**

---

## PRÓXIMOS PASOS RECOMENDADOS

1. **Semana 1:** Setup básico (Nivel 1) + hosting
2. **Semana 2:** Funcionalidades avanzadas (Nivel 2)
3. **Semana 3:** Backend + Base de datos (Nivel 3)
4. **Semana 4:** Testing + Deploy producción
5. **Semana 5+:** Marketing + feedback usuarios

---

## RECURSOS DE APRENDIZAJE

### Videos/Cursos:
- React: "React - The Complete Guide" (Udemy)
- Node.js: "The Complete Node.js Developer Course" (Udemy)
- MongoDB: Documentación oficial MongoDB University (gratis)

### Documentación:
- React: https://react.dev
- Express: https://expressjs.com
- MongoDB: https://docs.mongodb.com
- Vercel: https://vercel.com/docs

### Comunidades:
- Reddit: r/reactjs, r/node
- Discord: Reactiflux
- Stack Overflow

---

**¿Necesitas ayuda específica con algún nivel?**  
Puedo darte código detallado para cualquiera de estas secciones.
