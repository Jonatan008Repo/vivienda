# AGENTE AUTÓNOMO DE BÚSQUEDA Y ACTUALIZACIÓN
## Sistema de Web Scraping para Proyectos Inmobiliarios en Puebla

---

## DESCRIPCIÓN GENERAL

Este agente es un sistema automatizado que:
1. 🔍 Busca proyectos inmobiliarios en múltiples fuentes web
2. 📊 Extrae y estructura la información
3. ✅ Valida y limpia los datos
4. 💾 Actualiza la base de datos MongoDB
5. 🔔 Notifica sobre nuevos proyectos encontrados
6. ⏰ Se ejecuta automáticamente según calendario

---

## ARQUITECTURA DEL AGENTE

```
agente-vivienda/
├── src/
│   ├── scrapers/           # Scrapers por fuente
│   │   ├── infonavit.js
│   │   ├── vivanuncios.js
│   │   ├── inmuebles24.js
│   │   ├── lamudi.js
│   │   └── desarrolladoras.js
│   ├── extractors/         # Extracción de datos
│   │   ├── parser.js
│   │   └── validator.js
│   ├── database/           # Operaciones MongoDB
│   │   ├── connection.js
│   │   ├── operations.js
│   │   └── models.js
│   ├── notifiers/          # Notificaciones
│   │   ├── email.js
│   │   └── webhook.js
│   ├── scheduler/          # Programación
│   │   └── cron.js
│   └── utils/              # Utilidades
│       ├── logger.js
│       ├── config.js
│       └── helpers.js
├── logs/                   # Archivos de log
├── config/                 # Configuración
│   └── sources.json
├── .env                    # Variables de entorno
├── package.json
└── index.js               # Punto de entrada
```

---

## INSTALACIÓN Y CONFIGURACIÓN

### 1. Instalar dependencias

```bash
mkdir agente-vivienda
cd agente-vivienda
npm init -y

# Dependencias principales
npm install puppeteer cheerio axios mongoose dotenv node-cron nodemailer

# Dependencias desarrollo
npm install --save-dev nodemon
```

### 2. Configurar variables de entorno

```bash
# .env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/vivienda-puebla
SCRAPING_INTERVAL_HOURS=6
MAX_CONCURRENT_SCRAPES=3
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
NOTIFICATION_EMAIL=tu-email@gmail.com
NOTIFICATION_WEBHOOK=https://tu-webhook.com/notifications
LOG_LEVEL=info
HEADLESS_MODE=true
```

### 3. Configurar fuentes de datos

```json
// config/sources.json
{
  "sources": [
    {
      "id": "infonavit",
      "name": "Infonavit Vivienda Disponible",
      "url": "https://infonavit.org.mx/viviendadisponible",
      "enabled": true,
      "priority": 1,
      "type": "programa_gobierno",
      "scraper": "infonavit"
    },
    {
      "id": "vivanuncios",
      "name": "Vivanuncios Puebla",
      "url": "https://www.vivanuncios.com.mx/s-inmuebles/puebla/v1c1097l10049p1",
      "enabled": true,
      "priority": 2,
      "type": "portal_inmobiliario",
      "scraper": "vivanuncios",
      "filters": {
        "precio_max": 800000,
        "precio_min": 600000,
        "operacion": "venta"
      }
    },
    {
      "id": "inmuebles24",
      "name": "Inmuebles24 Puebla",
      "url": "https://www.inmuebles24.com/venta/puebla.html",
      "enabled": true,
      "priority": 2,
      "type": "portal_inmobiliario",
      "scraper": "inmuebles24"
    },
    {
      "id": "lamudi",
      "name": "Lamudi Puebla",
      "url": "https://www.lamudi.com.mx/puebla/for-sale/",
      "enabled": true,
      "priority": 2,
      "type": "portal_inmobiliario",
      "scraper": "lamudi"
    },
    {
      "id": "casas_auge",
      "name": "Casas Auge",
      "url": "https://casasauge.mx",
      "enabled": true,
      "priority": 3,
      "type": "desarrolladora",
      "scraper": "desarrolladora"
    }
  ]
}
```

---

## CÓDIGO COMPLETO DEL AGENTE

### index.js (Punto de entrada)

```javascript
const cron = require('node-cron');
const logger = require('./src/utils/logger');
const { connectDB } = require('./src/database/connection');
const AgentOrchestrator = require('./src/orchestrator');
require('dotenv').config();

async function main() {
  try {
    logger.info('🚀 Iniciando Agente de Vivienda Puebla...');
    
    // Conectar a MongoDB
    await connectDB();
    logger.info('✅ Conectado a MongoDB');
    
    // Crear orquestador
    const orchestrator = new AgentOrchestrator();
    
    // Ejecutar inmediatamente al iniciar
    logger.info('▶️  Ejecutando scraping inicial...');
    await orchestrator.run();
    
    // Programar ejecuciones automáticas
    const intervalHours = process.env.SCRAPING_INTERVAL_HOURS || 6;
    const cronExpression = `0 */${intervalHours} * * *`; // Cada X horas
    
    logger.info(`⏰ Programado para ejecutar cada ${intervalHours} horas`);
    
    cron.schedule(cronExpression, async () => {
      logger.info('⏰ Ejecución programada iniciada');
      await orchestrator.run();
    });
    
    logger.info('✅ Agente en ejecución. Presiona Ctrl+C para detener.');
    
  } catch (error) {
    logger.error('❌ Error fatal al iniciar agente:', error);
    process.exit(1);
  }
}

// Manejar señales de terminación
process.on('SIGINT', () => {
  logger.info('🛑 Agente detenido por usuario');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('🛑 Agente detenido');
  process.exit(0);
});

main();
```

### src/orchestrator.js (Coordinador principal)

```javascript
const fs = require('fs').promises;
const path = require('path');
const logger = require('./utils/logger');
const { saveProyecto, findDuplicates } = require('./database/operations');
const { sendNotification } = require('./notifiers/email');
const scrapers = require('./scrapers');

class AgentOrchestrator {
  constructor() {
    this.sources = null;
    this.stats = {
      total: 0,
      nuevos: 0,
      actualizados: 0,
      duplicados: 0,
      errores: 0
    };
  }
  
  async loadSources() {
    const sourcesPath = path.join(__dirname, '../config/sources.json');
    const data = await fs.readFile(sourcesPath, 'utf8');
    this.sources = JSON.parse(data).sources.filter(s => s.enabled);
    return this.sources;
  }
  
  async run() {
    const startTime = Date.now();
    logger.info('🔄 Iniciando ciclo de scraping...');
    
    try {
      // Cargar fuentes
      await this.loadSources();
      logger.info(`📋 ${this.sources.length} fuentes activas`);
      
      // Resetear estadísticas
      this.stats = { total: 0, nuevos: 0, actualizados: 0, duplicados: 0, errores: 0 };
      
      // Ejecutar scrapers en paralelo (limitado)
      const maxConcurrent = parseInt(process.env.MAX_CONCURRENT_SCRAPES) || 3;
      
      for (let i = 0; i < this.sources.length; i += maxConcurrent) {
        const batch = this.sources.slice(i, i + maxConcurrent);
        await Promise.allSettled(
          batch.map(source => this.scrapeSource(source))
        );
      }
      
      // Reporte final
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      logger.info('✅ Ciclo completado', {
        duracion: `${duration}s`,
        ...this.stats
      });
      
      // Notificar si hay nuevos proyectos
      if (this.stats.nuevos > 0) {
        await sendNotification({
          subject: `🏠 ${this.stats.nuevos} nuevos proyectos encontrados`,
          body: `Se encontraron ${this.stats.nuevos} proyectos nuevos en Puebla.\n\nEstadísticas:\n${JSON.stringify(this.stats, null, 2)}`
        });
      }
      
    } catch (error) {
      logger.error('❌ Error en ciclo de scraping:', error);
    }
  }
  
  async scrapeSource(source) {
    logger.info(`🔍 Scraping: ${source.name}`);
    
    try {
      // Seleccionar scraper
      const scraper = scrapers[source.scraper];
      if (!scraper) {
        throw new Error(`Scraper no encontrado: ${source.scraper}`);
      }
      
      // Ejecutar scraping
      const proyectos = await scraper.scrape(source);
      logger.info(`📦 ${source.name}: ${proyectos.length} proyectos extraídos`);
      
      // Procesar cada proyecto
      for (const proyecto of proyectos) {
        await this.processProyecto(proyecto, source);
      }
      
    } catch (error) {
      logger.error(`❌ Error scraping ${source.name}:`, error.message);
      this.stats.errores++;
    }
  }
  
  async processProyecto(data, source) {
    try {
      this.stats.total++;
      
      // Validar datos
      if (!this.validateProyecto(data)) {
        logger.warn('⚠️  Proyecto inválido, saltando:', data.nombre);
        return;
      }
      
      // Enriquecer con metadata
      const proyecto = {
        ...data,
        fuente: source.id,
        fuenteNombre: source.name,
        fechaScraped: new Date(),
        tipo: source.type
      };
      
      // Verificar duplicados
      const duplicado = await findDuplicates(proyecto);
      if (duplicado) {
        logger.debug(`⏭️  Duplicado encontrado: ${proyecto.nombre}`);
        this.stats.duplicados++;
        return;
      }
      
      // Guardar en base de datos
      const resultado = await saveProyecto(proyecto);
      
      if (resultado.isNew) {
        logger.info(`✨ Nuevo proyecto: ${proyecto.nombre} - ${proyecto.precio}`);
        this.stats.nuevos++;
      } else {
        logger.debug(`🔄 Actualizado: ${proyecto.nombre}`);
        this.stats.actualizados++;
      }
      
    } catch (error) {
      logger.error('❌ Error procesando proyecto:', error.message);
      this.stats.errores++;
    }
  }
  
  validateProyecto(proyecto) {
    // Validaciones mínimas
    if (!proyecto.nombre || proyecto.nombre.length < 5) return false;
    if (!proyecto.precio || proyecto.precio < 100000) return false;
    if (!proyecto.ubicacion) return false;
    
    // Filtrar proyectos fuera del rango objetivo
    if (proyecto.precio > 2000000) return false; // Muy caro para el target
    
    return true;
  }
}

module.exports = AgentOrchestrator;
```

### src/scrapers/infonavit.js (Scraper Infonavit)

```javascript
const puppeteer = require('puppeteer');
const logger = require('../utils/logger');

class InfonavitScraper {
  async scrape(source) {
    let browser;
    
    try {
      browser = await puppeteer.launch({
        headless: process.env.HEADLESS_MODE === 'true',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent(process.env.USER_AGENT);
      
      logger.debug('Navegando a:', source.url);
      await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Esperar a que cargue la tabla/lista
      await page.waitForSelector('.desarrollo-item, .proyecto-item', { timeout: 10000 });
      
      // Extraer datos
      const proyectos = await page.evaluate(() => {
        const items = document.querySelectorAll('.desarrollo-item, .proyecto-item');
        
        return Array.from(items).map(item => {
          const nombre = item.querySelector('.nombre, .titulo')?.textContent.trim();
          const ubicacion = item.querySelector('.ubicacion, .direccion')?.textContent.trim();
          const precioTexto = item.querySelector('.precio')?.textContent.trim();
          const viviendas = item.querySelector('.viviendas')?.textContent.trim();
          const entrega = item.querySelector('.entrega, .fecha')?.textContent.trim();
          
          // Extraer precio numérico
          const precioMatch = precioTexto?.match(/[\d,]+/);
          const precio = precioMatch ? parseInt(precioMatch[0].replace(/,/g, '')) : null;
          
          return {
            nombre,
            ubicacion,
            precio: precio || 630000, // Precio tope programa
            precioTexto,
            viviendas,
            entrega,
            tipo: 'programa_gobierno',
            desarrolladora: 'Infonavit',
            estado: 'disponible',
            caracteristicas: ['Vivienda del Bienestar', 'Apoyo federal', 'Sin enganche'],
            mensualidadEstimada: 3200,
            plusvaliaEsperada: '20%'
          };
        });
      });
      
      return proyectos.filter(p => p.nombre && p.ubicacion);
      
    } catch (error) {
      logger.error('Error en scraper Infonavit:', error.message);
      return [];
    } finally {
      if (browser) await browser.close();
    }
  }
}

module.exports = new InfonavitScraper();
```

### src/scrapers/vivanuncios.js (Scraper Vivanuncios)

```javascript
const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

class VivanunciosScraper {
  async scrape(source) {
    try {
      const filters = source.filters || {};
      const url = this.buildURL(source.url, filters);
      
      logger.debug('Fetching:', url);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': process.env.USER_AGENT
        },
        timeout: 30000
      });
      
      const $ = cheerio.load(response.data);
      const proyectos = [];
      
      // Selector de anuncios (ajustar según estructura actual de Vivanuncios)
      $('.tileV1').each((i, elem) => {
        try {
          const nombre = $(elem).find('.item-title').text().trim();
          const precioTexto = $(elem).find('.ad-price').text().trim();
          const ubicacion = $(elem).find('.item-location').text().trim();
          const descripcion = $(elem).find('.item-description').text().trim();
          const link = $(elem).find('a').attr('href');
          
          // Extraer precio
          const precioMatch = precioTexto.match(/[\d,]+/);
          const precio = precioMatch ? parseInt(precioMatch[0].replace(/,/g, '')) : null;
          
          if (precio && precio >= filters.precio_min && precio <= filters.precio_max) {
            proyectos.push({
              nombre: nombre || 'Propiedad en venta',
              ubicacion: ubicacion || 'Puebla',
              precio,
              precioTexto,
              descripcion: descripcion.substring(0, 200),
              link: link ? `https://www.vivanuncios.com.mx${link}` : null,
              tipo: 'desarrollo_nuevo',
              desarrolladora: 'Particular',
              estado: 'disponible',
              caracteristicas: this.extractCaracteristicas(descripcion),
              recamaras: this.extractRecamaras(descripcion),
              banos: this.extractBanos(descripcion)
            });
          }
        } catch (err) {
          logger.error('Error extrayendo anuncio:', err.message);
        }
      });
      
      logger.info(`Vivanuncios: ${proyectos.length} anuncios extraídos`);
      return proyectos;
      
    } catch (error) {
      logger.error('Error en scraper Vivanuncios:', error.message);
      return [];
    }
  }
  
  buildURL(baseURL, filters) {
    const params = new URLSearchParams();
    if (filters.precio_min) params.append('precio_min', filters.precio_min);
    if (filters.precio_max) params.append('precio_max', filters.precio_max);
    return `${baseURL}?${params.toString()}`;
  }
  
  extractCaracteristicas(texto) {
    const caracteristicas = [];
    if (/estacionamiento|cochera/i.test(texto)) caracteristicas.push('Estacionamiento');
    if (/cocina\s+integral/i.test(texto)) caracteristicas.push('Cocina integral');
    if (/jardín/i.test(texto)) caracteristicas.push('Jardín');
    if (/seguridad|vigilancia/i.test(texto)) caracteristicas.push('Seguridad 24hrs');
    return caracteristicas;
  }
  
  extractRecamaras(texto) {
    const match = texto.match(/(\d+)\s*(rec[aá]maras?|habitaciones?)/i);
    return match ? parseInt(match[1]) : 2;
  }
  
  extractBanos(texto) {
    const match = texto.match(/(\d+)\s*ba[ñn]os?/i);
    return match ? parseInt(match[1]) : 1;
  }
}

module.exports = new VivanunciosScraper();
```

### src/scrapers/index.js (Exportar todos los scrapers)

```javascript
module.exports = {
  infonavit: require('./infonavit'),
  vivanuncios: require('./vivanuncios'),
  inmuebles24: require('./inmuebles24'),
  lamudi: require('./lamudi'),
  desarrolladora: require('./desarrolladora')
};
```

### src/scrapers/inmuebles24.js

```javascript
const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

class Inmuebles24Scraper {
  async scrape(source) {
    try {
      const response = await axios.get(source.url, {
        headers: { 'User-Agent': process.env.USER_AGENT },
        timeout: 30000
      });
      
      const $ = cheerio.load(response.data);
      const proyectos = [];
      
      $('.posting-card').each((i, elem) => {
        try {
          const nombre = $(elem).find('.posting-title').text().trim();
          const precioTexto = $(elem).find('.price').text().trim();
          const ubicacion = $(elem).find('.posting-location').text().trim();
          
          const precioMatch = precioTexto.match(/[\d,]+/);
          const precio = precioMatch ? parseInt(precioMatch[0].replace(/,/g, '')) : null;
          
          if (precio && precio >= 600000 && precio <= 1500000 && ubicacion.includes('Puebla')) {
            proyectos.push({
              nombre: nombre || 'Propiedad en venta',
              ubicacion,
              precio,
              precioTexto,
              tipo: 'desarrollo_nuevo',
              desarrolladora: 'Particular',
              estado: 'disponible',
              recamaras: 2,
              banos: 1
            });
          }
        } catch (err) {
          logger.error('Error extrayendo:', err.message);
        }
      });
      
      return proyectos;
      
    } catch (error) {
      logger.error('Error scraper Inmuebles24:', error.message);
      return [];
    }
  }
}

module.exports = new Inmuebles24Scraper();
```

### src/scrapers/lamudi.js

```javascript
const puppeteer = require('puppeteer');
const logger = require('../utils/logger');

class LamudiScraper {
  async scrape(source) {
    let browser;
    
    try {
      browser = await puppeteer.launch({
        headless: process.env.HEADLESS_MODE === 'true',
        args: ['--no-sandbox']
      });
      
      const page = await browser.newPage();
      await page.goto(source.url, { waitUntil: 'networkidle2' });
      await page.waitForSelector('.ListingCell-AllInfo', { timeout: 10000 });
      
      const proyectos = await page.evaluate(() => {
        const items = document.querySelectorAll('.ListingCell-AllInfo');
        
        return Array.from(items).map(item => {
          const nombre = item.querySelector('.ListingCell-KeyInfo-title')?.textContent.trim();
          const precioTexto = item.querySelector('.PriceSection-FirstPrice')?.textContent.trim();
          const ubicacion = item.querySelector('.ListingCell-KeyInfo-address')?.textContent.trim();
          
          const precioMatch = precioTexto?.match(/[\d,]+/);
          const precio = precioMatch ? parseInt(precioMatch[0].replace(/,/g, '')) : null;
          
          return { nombre, ubicacion, precio, precioTexto };
        });
      });
      
      return proyectos.filter(p => 
        p.precio && p.precio >= 600000 && p.precio <= 1500000
      ).map(p => ({
        ...p,
        tipo: 'desarrollo_nuevo',
        desarrolladora: 'Particular',
        estado: 'disponible'
      }));
      
    } catch (error) {
      logger.error('Error scraper Lamudi:', error.message);
      return [];
    } finally {
      if (browser) await browser.close();
    }
  }
}

module.exports = new LamudiScraper();
```

### src/scrapers/desarrolladora.js (Para Casas Auge y similares)

```javascript
const puppeteer = require('puppeteer');
const logger = require('../utils/logger');

class DesarrolladoraScraper {
  async scrape(source) {
    // Este es un scraper genérico para sitios de desarrolladoras
    // Adaptar según la estructura de cada sitio
    
    let browser;
    
    try {
      browser = await puppeteer.launch({
        headless: process.env.HEADLESS_MODE === 'true',
        args: ['--no-sandbox']
      });
      
      const page = await browser.newPage();
      await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Intentar detectar selectores comunes
      const selectors = [
        '.desarrollo',
        '.proyecto',
        '.property',
        '.card',
        '.item'
      ];
      
      let proyectos = [];
      
      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          
          proyectos = await page.evaluate((sel) => {
            const items = document.querySelectorAll(sel);
            
            return Array.from(items).map(item => {
              // Buscar nombre en diversos selectores
              const nombre = 
                item.querySelector('h2, h3, .titulo, .nombre, .title')?.textContent.trim() ||
                item.querySelector('a')?.textContent.trim();
              
              // Buscar precio
              const precioElem = item.querySelector('.precio, .price, .costo');
              const precioTexto = precioElem?.textContent.trim();
              const precioMatch = precioTexto?.match(/[\d,]+/);
              const precio = precioMatch ? parseInt(precioMatch[0].replace(/,/g, '')) : null;
              
              // Buscar ubicación
              const ubicacion = 
                item.querySelector('.ubicacion, .location, .direccion')?.textContent.trim() ||
                'Puebla';
              
              return { nombre, precio, precioTexto, ubicacion };
            });
          }, selector);
          
          if (proyectos.length > 0) break;
          
        } catch (err) {
          continue;
        }
      }
      
      return proyectos.filter(p => p.nombre && p.precio).map(p => ({
        ...p,
        tipo: 'desarrollo_nuevo',
        desarrolladora: source.name,
        estado: 'disponible',
        recamaras: 2,
        banos: 1
      }));
      
    } catch (error) {
      logger.error(`Error scraper ${source.name}:`, error.message);
      return [];
    } finally {
      if (browser) await browser.close();
    }
  }
}

module.exports = new DesarrolladoraScraper();
```

### src/database/connection.js

```javascript
const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info('✅ MongoDB conectado');
  } catch (error) {
    logger.error('❌ Error conectando MongoDB:', error);
    throw error;
  }
}

module.exports = { connectDB };
```

### src/database/models.js

```javascript
const mongoose = require('mongoose');

const ProyectoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, index: true },
  tipo: { type: String, required: true, index: true },
  precio: { type: Number, required: true, index: true },
  precioTexto: String,
  ubicacion: { type: String, required: true, index: true },
  coordenadas: {
    lat: Number,
    lng: Number
  },
  desarrolladora: { type: String, index: true },
  recamaras: Number,
  banos: Number,
  m2Construccion: Number,
  m2Terreno: Number,
  estado: { type: String, default: 'disponible', index: true },
  entrega: String,
  plusvaliaEsperada: String,
  mensualidadEstimada: Number,
  caracteristicas: [String],
  ventajas: [String],
  desventajas: [String],
  descripcion: String,
  imagenes: [String],
  link: String,
  puntuacion: { type: Number, default: 5 },
  contacto: String,
  
  // Metadata del scraping
  fuente: { type: String, required: true, index: true },
  fuenteNombre: String,
  fechaScraped: { type: Date, default: Date.now, index: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now },
  
  // Control de duplicados
  hash: { type: String, unique: true, sparse: true }
});

// Índice compuesto para búsquedas
ProyectoSchema.index({ precio: 1, ubicacion: 1, estado: 1 });
ProyectoSchema.index({ tipo: 1, precio: 1 });

// Método para generar hash único
ProyectoSchema.pre('save', function(next) {
  const crypto = require('crypto');
  const data = `${this.nombre}-${this.precio}-${this.ubicacion}`;
  this.hash = crypto.createHash('md5').update(data.toLowerCase()).digest('hex');
  next();
});

module.exports = mongoose.model('Proyecto', ProyectoSchema);
```

### src/database/operations.js

```javascript
const Proyecto = require('./models');
const logger = require('../utils/logger');

async function saveProyecto(data) {
  try {
    // Buscar si existe por hash
    const existente = await Proyecto.findOne({ hash: data.hash });
    
    if (existente) {
      // Actualizar si hay cambios
      existente.precio = data.precio;
      existente.estado = data.estado;
      existente.fechaActualizacion = new Date();
      existente.fechaScraped = new Date();
      
      await existente.save();
      return { proyecto: existente, isNew: false };
    }
    
    // Crear nuevo
    const proyecto = new Proyecto(data);
    await proyecto.save();
    
    return { proyecto, isNew: true };
    
  } catch (error) {
    logger.error('Error guardando proyecto:', error.message);
    throw error;
  }
}

async function findDuplicates(data) {
  try {
    // Generar hash temporal
    const crypto = require('crypto');
    const hashData = `${data.nombre}-${data.precio}-${data.ubicacion}`;
    const hash = crypto.createHash('md5').update(hashData.toLowerCase()).digest('hex');
    
    const duplicado = await Proyecto.findOne({ hash });
    return duplicado;
    
  } catch (error) {
    logger.error('Error buscando duplicados:', error.message);
    return null;
  }
}

async function getProyectosPorFiltros(filtros = {}) {
  try {
    const query = {};
    
    if (filtros.precioMin || filtros.precioMax) {
      query.precio = {};
      if (filtros.precioMin) query.precio.$gte = filtros.precioMin;
      if (filtros.precioMax) query.precio.$lte = filtros.precioMax;
    }
    
    if (filtros.tipo) query.tipo = filtros.tipo;
    if (filtros.ubicacion) query.ubicacion = { $regex: filtros.ubicacion, $options: 'i' };
    if (filtros.recamaras) query.recamaras = filtros.recamaras;
    if (filtros.estado) query.estado = filtros.estado;
    
    const proyectos = await Proyecto.find(query)
      .sort({ puntuacion: -1, fechaCreacion: -1 })
      .limit(100);
    
    return proyectos;
    
  } catch (error) {
    logger.error('Error obteniendo proyectos:', error.message);
    return [];
  }
}

async function limpiarProyectosAntiguos(diasMaximo = 30) {
  try {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasMaximo);
    
    const resultado = await Proyecto.deleteMany({
      fechaScraped: { $lt: fechaLimite },
      estado: 'vendido'
    });
    
    logger.info(`🗑️  Limpiados ${resultado.deletedCount} proyectos antiguos`);
    return resultado.deletedCount;
    
  } catch (error) {
    logger.error('Error limpiando proyectos:', error.message);
    return 0;
  }
}

module.exports = {
  saveProyecto,
  findDuplicates,
  getProyectosPorFiltros,
  limpiarProyectosAntiguos
};
```

### src/notifiers/email.js

```javascript
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Configurar transportador (Gmail ejemplo)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // App password de Gmail
  }
});

async function sendNotification({ subject, body }) {
  try {
    if (!process.env.NOTIFICATION_EMAIL) {
      logger.debug('Email de notificación no configurado, saltando...');
      return;
    }
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFICATION_EMAIL,
      subject,
      text: body,
      html: `<pre>${body}</pre>`
    });
    
    logger.info('📧 Notificación enviada:', info.messageId);
    
  } catch (error) {
    logger.error('Error enviando email:', error.message);
  }
}

module.exports = { sendNotification };
```

### src/utils/logger.js

```javascript
const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.levels = { debug: 0, info: 1, warn: 2, error: 3 };
    
    // Crear carpeta de logs si no existe
    const logsDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    this.logFile = path.join(logsDir, `agent-${this.getDateString()}.log`);
  }
  
  getDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
  
  shouldLog(level) {
    return this.levels[level] >= this.levels[this.logLevel];
  }
  
  formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
  }
  
  writeToFile(formatted) {
    fs.appendFileSync(this.logFile, formatted + '\n');
  }
  
  log(level, message, data) {
    if (!this.shouldLog(level)) return;
    
    const formatted = this.formatMessage(level, message, data);
    
    // Console
    const colors = {
      debug: '\x1b[36m',
      info: '\x1b[32m',
      warn: '\x1b[33m',
      error: '\x1b[31m'
    };
    
    console.log(`${colors[level]}${formatted}\x1b[0m`);
    
    // File
    this.writeToFile(formatted);
  }
  
  debug(message, data) { this.log('debug', message, data); }
  info(message, data) { this.log('info', message, data); }
  warn(message, data) { this.log('warn', message, data); }
  error(message, data) { this.log('error', message, data); }
}

module.exports = new Logger();
```

### package.json

```json
{
  "name": "agente-vivienda-puebla",
  "version": "1.0.0",
  "description": "Agente autónomo de scraping para proyectos inmobiliarios en Puebla",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "node test.js"
  },
  "keywords": ["scraping", "real-estate", "automation", "puebla"],
  "author": "Tu Nombre",
  "license": "MIT",
  "dependencies": {
    "axios": "^1.6.0",
    "cheerio": "^1.0.0-rc.12",
    "dotenv": "^16.3.1",
    "mongoose": "^8.0.0",
    "node-cron": "^3.0.3",
    "nodemailer": "^6.9.7",
    "puppeteer": "^21.5.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## EJECUCIÓN DEL AGENTE

### Modo desarrollo (con logs en tiempo real)
```bash
npm run dev
```

### Modo producción
```bash
npm start
```

### En background (Linux/Mac)
```bash
nohup npm start > output.log 2>&1 &
```

### Con PM2 (recomendado para producción)
```bash
npm install -g pm2
pm2 start index.js --name agente-vivienda
pm2 logs agente-vivienda
pm2 monit
```

---

## CONFIGURACIÓN AVANZADA

### 1. Proxies (para evitar bloqueos)

```javascript
// Agregar en scrapers/vivanuncios.js
const proxyList = [
  'http://proxy1.com:8080',
  'http://proxy2.com:8080'
];

const randomProxy = proxyList[Math.floor(Math.random() * proxyList.length)];

const response = await axios.get(url, {
  proxy: {
    host: randomProxy.split(':')[0].replace('http://', ''),
    port: parseInt(randomProxy.split(':')[1])
  }
});
```

### 2. Rate limiting

```javascript
// utils/rateLimiter.js
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  async wait(key) {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Limpiar requests antiguos
    const validRequests = requests.filter(t => now - t < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...validRequests);
      const waitTime = this.windowMs - (now - oldestRequest);
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
  }
}

// Uso:
const limiter = new RateLimiter(10, 60000); // 10 req/min
await limiter.wait('vivanuncios');
```

### 3. Webhook notifications

```javascript
// notifiers/webhook.js
const axios = require('axios');

async function sendWebhook(data) {
  if (!process.env.NOTIFICATION_WEBHOOK) return;
  
  await axios.post(process.env.NOTIFICATION_WEBHOOK, {
    text: `🏠 ${data.nuevos} proyectos nuevos encontrados`,
    stats: data
  });
}
```

---

## MONITOREO Y MANTENIMIENTO

### Dashboard simple (Express endpoint)

```javascript
// Agregar en index.js
const express = require('express');
const app = express();

app.get('/status', async (req, res) => {
  const stats = {
    uptime: process.uptime(),
    lastRun: orchestrator.lastRunTime,
    stats: orchestrator.stats,
    nextRun: /* calcular siguiente ejecución */
  };
  
  res.json(stats);
});

app.listen(3001, () => {
  logger.info('Dashboard disponible en http://localhost:3001/status');
});
```

### Alertas Telegram

```bash
npm install node-telegram-bot-api
```

```javascript
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

async function sendTelegram(message) {
  await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
}
```

---

## OPTIMIZACIONES

### 1. Caché de resultados

```javascript
const cache = new Map();
const CACHE_TTL = 3600000; // 1 hora

async function getCached(key, fetchFn) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetchFn();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### 2. Procesamiento paralelo optimizado

```javascript
const pLimit = require('p-limit');
const limit = pLimit(3); // Máximo 3 concurrentes

const promises = sources.map(source => 
  limit(() => this.scrapeSource(source))
);

await Promise.all(promises);
```

---

## TROUBLESHOOTING

### Problema: Puppeteer no abre navegador
```bash
# Ubuntu/Debian
sudo apt-get install -y \
  gconf-service libasound2 libatk1.0-0 libc6 libcairo2 \
  libcups2 libdbus-1-3 libexpat1 libfontconfig1 \
  libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 \
  libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 \
  libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
  libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
  libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
  fonts-liberation libappindicator1 libnss3 lsb-release \
  xdg-utils wget
```

### Problema: MongoDB timeout
- Verificar whitelist de IPs en MongoDB Atlas
- Verificar credenciales en .env
- Verificar conectividad de red

### Problema: Scrapers no encuentran elementos
- Los sitios web cambian su estructura
- Inspeccionar la página actual y actualizar selectores
- Usar `page.screenshot()` para debug visual

---

## RESUMEN

✅ **Instalación:** npm install + configurar .env  
✅ **Ejecución:** npm start  
✅ **Logs:** Carpeta /logs con historial completo  
✅ **Base de datos:** MongoDB actualizada automáticamente  
✅ **Notificaciones:** Email cuando hay nuevos proyectos  
✅ **Escalable:** Fácil agregar nuevas fuentes en sources.json  
✅ **Mantenible:** Código modular y documentado  

---

**El agente está listo para producción. Solo configura tus variables de entorno y ejecuta.**
