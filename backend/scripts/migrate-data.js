require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Proyecto = require('../models/Proyecto');

const proyectosIniciales = [
  {
    nombre: "Vivienda del Bienestar - Lomas de San Miguel",
    tipo: "programa_gobierno",
    precio: 600000,
    ubicacion: "Lomas de San Miguel, Puebla",
    coordenadas: { lat: 19.0264, lng: -98.2538 },
    desarrolladora: "Infonavit Constructora S.A. de C.V.",
    recamaras: 2,
    banos: 1,
    m2Construccion: 60,
    m2Terreno: 60,
    estado: "vendido",
    entrega: "2026-2027",
    plusvaliaEsperada: "15%",
    mensualidadEstimada: 3000,
    caracteristicas: [
      "Edificios de 3 niveles",
      "Fachada de ladrillo",
      "Áreas verdes comunes",
      "Calles internas: Granito, Obsidiana, Ónix",
      "Cerca del Archivo General del Estado"
    ],
    ventajas: [
      "Precio más bajo del mercado",
      "Apoyo gubernamental",
      "Mensualidad máx 30% ingreso"
    ],
    desventajas: [
      "YA VENDIDO (832 viviendas)",
      "Lista de espera para próximas etapas",
      "Zona con déficit de servicios"
    ],
    puntuacion: 7.5,
    contacto: "Punto de venta: Coyoacán 5439, Col. Lomas de San Miguel"
  },
  {
    nombre: "Próximos Proyectos Vivienda del Bienestar - Puebla Capital",
    tipo: "programa_gobierno",
    precio: 630000,
    ubicacion: "Por definir - Norte/Poniente Puebla",
    coordenadas: { lat: 19.04, lng: -98.20 },
    desarrolladora: "Infonavit / Conavi",
    recamaras: 2,
    banos: 1,
    m2Construccion: 60,
    m2Terreno: 60,
    estado: "por_anunciar",
    entrega: "2027-2028",
    plusvaliaEsperada: "20%",
    mensualidadEstimada: 3200,
    caracteristicas: [
      "Zonas candidatas: San Pablo Xochimehuacan, La Resurrección",
      "Posible donación de predios estatales",
      "Modelo similar a Lomas de San Miguel",
      "Requisito: 1-2 salarios mínimos"
    ],
    ventajas: [
      "Precio tope $630,000",
      "Apoyo federal",
      "Sin enganche",
      "Mensualidad controlada"
    ],
    desventajas: [
      "Aún no confirmado",
      "Fecha incierta",
      "Alta demanda esperada"
    ],
    puntuacion: 8.0,
    contacto: "Monitorear: infonavit.org.mx/viviendadisponible"
  },
  {
    nombre: "Vivienda del Bienestar - Atlixco",
    tipo: "programa_gobierno",
    precio: 630000,
    ubicacion: "Atlixco, Puebla",
    coordenadas: { lat: 18.9057, lng: -98.4315 },
    desarrolladora: "Fovissste / Conavi",
    recamaras: 2,
    banos: 1,
    m2Construccion: 60,
    m2Terreno: 60,
    estado: "por_iniciar",
    entrega: "2026",
    plusvaliaEsperada: "25%",
    mensualidadEstimada: 3200,
    caracteristicas: [
      "500 viviendas confirmadas",
      "Primer predio Fovissste autorizado",
      "Valle de Atlixco - clima privilegiado",
      "Ventanilla por abrir en 2026"
    ],
    ventajas: [
      "Menor competencia que capital",
      "Atlixco: Pueblo Mágico",
      "Mejor clima que Puebla capital",
      "Alta probabilidad de obtenerla"
    ],
    desventajas: [
      "A 33 km de Puebla capital",
      "Menor oferta de empleo local",
      "Aún no abre registro"
    ],
    puntuacion: 8.5,
    contacto: "Estar pendiente anuncio oficial Gobierno de Puebla"
  },
  {
    nombre: "Departamento Infonavit Agua Santa",
    tipo: "reventa_infonavit",
    precio: 850000,
    ubicacion: "Infonavit Agua Santa, Sur Puebla",
    coordenadas: { lat: 19.015, lng: -98.183 },
    desarrolladora: "Reventa particular",
    recamaras: 3,
    banos: 1,
    m2Construccion: 75,
    m2Terreno: 0,
    estado: "disponible",
    entrega: "inmediata",
    plusvaliaEsperada: "10-15%",
    mensualidadEstimada: 4400,
    caracteristicas: [
      "Edificio C-23, Planta baja",
      "3 recámaras con closets",
      "Cocina integral",
      "1 cajón estacionamiento",
      "Bodega"
    ],
    ventajas: [
      "Acepta Infonavit tradicional",
      "3 recámaras (raro a este precio)",
      "Planta baja (sin escaleras)",
      "RUTA Línea 2 - excelente transporte",
      "Servicios cercanos: Hospital, Centro Sur"
    ],
    desventajas: [
      "Edificio antiguo (25-30 años)",
      "Inseguridad reportada en zona",
      "Plusvalía lenta",
      "Requiere mantenimiento"
    ],
    puntuacion: 6.5,
    contacto: "Buscar en Vivanuncios/Mitula: Agua Santa C-23"
  },
  {
    nombre: "Cima del Bosque",
    tipo: "desarrollo_nuevo",
    precio: 1069000,
    ubicacion: "Periférico Ecológico, Puebla",
    coordenadas: { lat: 19.02, lng: -98.25 },
    desarrolladora: "Desarrollador privado",
    recamaras: 2,
    banos: 2,
    m2Construccion: 75,
    m2Terreno: 0,
    estado: "disponible",
    entrega: "febrero-2026",
    plusvaliaEsperada: "25-35%",
    mensualidadEstimada: 5200,
    caracteristicas: [
      "Departamentos nuevos",
      "Periférico Ecológico - zona verde",
      "Cerca del Bioparque",
      "Área protegida natural"
    ],
    ventajas: [
      "NUEVA construcción",
      "Zona de alto crecimiento",
      "Plusvalía garantizada",
      "Entrega inmediata (feb 2026)",
      "Acepta Infonavit"
    ],
    desventajas: [
      "Fuera del rango $600k-$800k",
      "Requiere $220k más vs Agua Santa"
    ],
    puntuacion: 9.0,
    contacto: "Buscar: Cima del Bosque Periférico Puebla"
  },
  {
    nombre: "Casas Auge - Cuatro Caminos",
    tipo: "desarrollo_nuevo",
    precio: 725000,
    ubicacion: "Col. Viveros, Tehuacán",
    coordenadas: { lat: 18.4625, lng: -97.3919 },
    desarrolladora: "Casas Auge",
    recamaras: 2,
    banos: 1,
    m2Construccion: 50,
    m2Terreno: 75,
    estado: "disponible",
    entrega: "2026",
    plusvaliaEsperada: "15-20%",
    mensualidadEstimada: 4200,
    caracteristicas: [
      "Casas independientes",
      "Opción de ampliación a 3ra recámara",
      "Estacionamiento al frente",
      "Cisterna y tinaco propios",
      "Privadas cerradas con portón"
    ],
    ventajas: [
      "Precio accesible",
      "Sistema sin enganche (historial crediticio)",
      "Casa completa ampliable",
      "Empresa poblana 46 años"
    ],
    desventajas: [
      "Tehuacán (80 km de Puebla)",
      "⚠️ DENUNCIAS por vicios ocultos 2023",
      "Materiales calidad cuestionable",
      "Menor plusvalía"
    ],
    puntuacion: 6.0,
    contacto: "(222) 237-3177 | contacto@casasauge.mx"
  },
  {
    nombre: "Casas Auge - Centenario",
    tipo: "desarrollo_nuevo",
    precio: 950000,
    ubicacion: "Sur de Puebla capital",
    coordenadas: { lat: 19.00, lng: -98.20 },
    desarrolladora: "Casas Auge",
    recamaras: 3,
    banos: 2,
    m2Construccion: 100,
    m2Terreno: 110,
    estado: "disponible",
    entrega: "2026",
    plusvaliaEsperada: "15-20%",
    mensualidadEstimada: 5000,
    caracteristicas: [
      "540 viviendas (desarrollo más grande)",
      "3 recámaras",
      "Fraccionamiento cerrado",
      "Zona sur Puebla"
    ],
    ventajas: [
      "Casa completa nueva",
      "3 recámaras",
      "Gran disponibilidad"
    ],
    desventajas: [
      "⚠️ ADVERTENCIA: Denuncias 2023 Centenario I",
      "Problemas estructurales reportados",
      "Falta de agua reportada",
      "Fuera de rango $600k-$800k"
    ],
    puntuacion: 5.5,
    contacto: "(222) 237-3177 | casasauge.mx"
  },
  {
    nombre: "Casas Auge - Apulco",
    tipo: "desarrollo_nuevo",
    precio: 800000,
    ubicacion: "Periférico Puebla (zona por confirmar)",
    coordenadas: { lat: 19.05, lng: -98.22 },
    desarrolladora: "Casas Auge",
    recamaras: 2,
    banos: 1,
    m2Construccion: 80,
    m2Terreno: 90,
    estado: "disponible",
    entrega: "2026",
    plusvaliaEsperada: "15-20%",
    mensualidadEstimada: 4500,
    caracteristicas: [
      "160 viviendas",
      "2-3 recámaras",
      "Periférico de Puebla",
      "Fraccionamiento cerrado"
    ],
    ventajas: [
      "Dentro del rango $600k-$800k",
      "Puebla capital",
      "Casa nueva"
    ],
    desventajas: [
      "⚠️ Misma desarrolladora con denuncias",
      "Ubicación periférica",
      "Calidad cuestionable"
    ],
    puntuacion: 6.0,
    contacto: "(222) 237-3177"
  }
];

const migrarDatos = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    console.log('🗑️  Limpiando colección existente...');
    await Proyecto.deleteMany({});

    console.log('📦 Insertando 8 proyectos iniciales...');
    const resultado = await Proyecto.insertMany(proyectosIniciales);
    console.log(`✅ Migración completada: ${resultado.length} proyectos insertados`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

migrarDatos();
