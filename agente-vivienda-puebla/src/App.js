import React, { useState, useMemo, useEffect } from 'react';
import { Home, MapPin, DollarSign, Building, TrendingUp, AlertCircle, Filter, X, ChevronDown, Search, Star, CheckCircle, Calendar, Phone } from 'lucide-react';
import { proyectosAPI } from './services/api';

// Base de datos fallback (sin API activa)
const PROYECTOS_FALLBACK = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
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
    id: 6,
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
    id: 7,
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
    id: 8,
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
]; // fin PROYECTOS_FALLBACK

const RECURSOS = [
  {
    titulo: "Infonavit - Vivienda Disponible",
    url: "https://infonavit.org.mx/viviendadisponible",
    descripcion: "Lista oficial de predios y desarrollos del programa Vivienda para el Bienestar"
  },
  {
    titulo: "Mi Cuenta Infonavit",
    url: "https://micuenta.infonavit.org.mx",
    descripcion: "Consulta puntos, precalificación y actualiza datos"
  },
  {
    titulo: "Conavi - Vivienda del Bienestar",
    url: "https://viviendabienestar.gob.mx",
    descripcion: "Pre-registro para el programa (si no cotizas Infonavit)"
  },
  {
    titulo: "Plataforma Nacional de Transparencia",
    url: "https://plataformadetransparencia.org.mx",
    descripcion: "Solicita información sobre predios y proyectos futuros"
  }
];

export default function AgenteViviendaPuebla() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [filtros, setFiltros] = useState({
    precioMin: 600000,
    precioMax: 800000,
    tipo: 'todos',
    recamaras: 'todas',
    estado: 'todos'
  });
  const [vistaActual, setVistaActual] = useState('busqueda');
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [comparacion, setComparacion] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

  // Cargar proyectos desde API, con fallback al array local
  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const response = await proyectosAPI.getAll();
        setProyectos(response.data);
        setApiError(null);
      } catch (err) {
        console.warn('API no disponible, usando datos locales:', err.message);
        setProyectos(PROYECTOS_FALLBACK);
        setApiError('Usando datos locales (backend no conectado)');
      } finally {
        setLoading(false);
      }
    };
    fetchProyectos();
  }, []);

  // Filtrar proyectos
  const proyectosFiltrados = useMemo(() => {
    return proyectos.filter(proyecto => {
      const cumplePrecio = proyecto.precio >= filtros.precioMin && proyecto.precio <= filtros.precioMax;
      const cumpleTipo = filtros.tipo === 'todos' || proyecto.tipo === filtros.tipo;
      const cumpleRecamaras = filtros.recamaras === 'todas' || proyecto.recamaras === parseInt(filtros.recamaras);
      const cumpleEstado = filtros.estado === 'todos' || proyecto.estado === filtros.estado;

      return cumplePrecio && cumpleTipo && cumpleRecamaras && cumpleEstado;
    }).sort((a, b) => b.puntuacion - a.puntuacion);
  }, [filtros, proyectos]);

  const formatPrecio = (precio) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(precio);
  };

  const calcularMensualidad = (precio) => {
    const tasa = 0.038; // 3.8% anual Infonavit
    const meses = 240; // 20 años
    const tasaMensual = tasa / 12;
    const mensualidad = precio * (tasaMensual * Math.pow(1 + tasaMensual, meses)) / (Math.pow(1 + tasaMensual, meses) - 1);
    return Math.round(mensualidad);
  };

  const toggleComparacion = (proyecto) => {
    if (comparacion.find(p => p.id === proyecto.id)) {
      setComparacion(comparacion.filter(p => p.id !== proyecto.id));
    } else if (comparacion.length < 3) {
      setComparacion([...comparacion, proyecto]);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      disponible: { color: 'bg-emerald-500', texto: 'Disponible' },
      vendido: { color: 'bg-red-500', texto: 'Vendido' },
      por_iniciar: { color: 'bg-amber-500', texto: 'Por iniciar' },
      por_anunciar: { color: 'bg-purple-500', texto: 'Por anunciar' }
    };
    return badges[estado] || badges.disponible;
  };

  const getTipoBadge = (tipo) => {
    const badges = {
      programa_gobierno: { color: 'bg-blue-600', texto: 'Vivienda del Bienestar', icon: '🏛️' },
      desarrollo_nuevo: { color: 'bg-green-600', texto: 'Desarrollo Nuevo', icon: '🏗️' },
      reventa_infonavit: { color: 'bg-orange-600', texto: 'Reventa Infonavit', icon: '🔄' }
    };
    return badges[tipo] || badges.desarrollo_nuevo;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Banner de estado API */}
      {apiError && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-800 text-center text-xs py-1 px-4">
          ⚠️ {apiError} — <a href="https://github.com/Jonatan008Repo/vivienda#backend" className="underline" target="_blank" rel="noreferrer">Ver instrucciones</a>
        </div>
      )}
      {loading && (
        <div className="bg-blue-50 border-b border-blue-200 text-blue-700 text-center text-xs py-1">
          Cargando proyectos...
        </div>
      )}
      {/* Header con diseño mexicano contemporáneo */}
      <header className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <Home className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  Agente Vivienda Puebla
                </h1>
                <p className="text-white/90 text-sm mt-1">Encuentra tu hogar ideal • $600k - $800k</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setVistaActual('busqueda')}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  vistaActual === 'busqueda'
                    ? 'bg-white text-orange-600 shadow-lg'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                Buscar
              </button>
              <button
                onClick={() => setVistaActual('comparar')}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  vistaActual === 'comparar'
                    ? 'bg-white text-orange-600 shadow-lg'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                Comparar ({comparacion.length})
              </button>
              <button
                onClick={() => setVistaActual('recursos')}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  vistaActual === 'recursos'
                    ? 'bg-white text-orange-600 shadow-lg'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                Recursos
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {vistaActual === 'busqueda' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Filtros laterales */}
            <div className="col-span-3">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-orange-500" />
                    Filtros
                  </h3>
                  <button
                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {mostrarFiltros ? <ChevronDown /> : <ChevronDown className="rotate-180" />}
                  </button>
                </div>

                {mostrarFiltros && (
                  <div className="space-y-6">
                    {/* Precio */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rango de Precio
                      </label>
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-gray-500">Mínimo</span>
                          <input
                            type="range"
                            min="500000"
                            max="1500000"
                            step="50000"
                            value={filtros.precioMin}
                            onChange={(e) => setFiltros({ ...filtros, precioMin: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <span className="text-sm font-bold text-orange-600">{formatPrecio(filtros.precioMin)}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Máximo</span>
                          <input
                            type="range"
                            min="500000"
                            max="1500000"
                            step="50000"
                            value={filtros.precioMax}
                            onChange={(e) => setFiltros({ ...filtros, precioMax: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <span className="text-sm font-bold text-orange-600">{formatPrecio(filtros.precioMax)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tipo */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
                      <select
                        value={filtros.tipo}
                        onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                      >
                        <option value="todos">Todos</option>
                        <option value="programa_gobierno">Vivienda del Bienestar</option>
                        <option value="desarrollo_nuevo">Desarrollo Nuevo</option>
                        <option value="reventa_infonavit">Reventa Infonavit</option>
                      </select>
                    </div>

                    {/* Recámaras */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Recámaras</label>
                      <select
                        value={filtros.recamaras}
                        onChange={(e) => setFiltros({ ...filtros, recamaras: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                      >
                        <option value="todas">Todas</option>
                        <option value="1">1 recámara</option>
                        <option value="2">2 recámaras</option>
                        <option value="3">3 recámaras</option>
                      </select>
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                      <select
                        value={filtros.estado}
                        onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                      >
                        <option value="todos">Todos</option>
                        <option value="disponible">Disponible</option>
                        <option value="por_iniciar">Por iniciar</option>
                        <option value="por_anunciar">Por anunciar</option>
                        <option value="vendido">Vendido</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setFiltros({
                        precioMin: 600000,
                        precioMax: 800000,
                        tipo: 'todos',
                        recamaras: 'todas',
                        estado: 'todos'
                      })}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg transition"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Resultados */}
            <div className="col-span-9">
              <div className="mb-6 bg-white rounded-xl shadow-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Encontrados: <span className="font-bold text-orange-600 text-lg">{proyectosFiltrados.length}</span> proyectos
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Rango: {formatPrecio(filtros.precioMin)} - {formatPrecio(filtros.precioMax)}
                  </p>
                </div>
                {comparacion.length > 0 && (
                  <div className="text-sm bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold">
                    {comparacion.length} seleccionados para comparar
                  </div>
                )}
              </div>

              <div className="grid gap-6">
                {proyectosFiltrados.map((proyecto) => {
                  const estadoBadge = getEstadoBadge(proyecto.estado);
                  const tipoBadge = getTipoBadge(proyecto.tipo);
                  const enComparacion = comparacion.find(p => p.id === proyecto.id);

                  return (
                    <div
                      key={proyecto.id}
                      className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                        enComparacion ? 'ring-4 ring-orange-400' : ''
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`${tipoBadge.color} text-white text-xs px-3 py-1 rounded-full font-semibold`}>
                                {tipoBadge.icon} {tipoBadge.texto}
                              </span>
                              <span className={`${estadoBadge.color} text-white text-xs px-3 py-1 rounded-full font-semibold`}>
                                {estadoBadge.texto}
                              </span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                              {proyecto.nombre}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-600 mb-3">
                              <MapPin className="w-4 h-4 text-orange-500" />
                              <span className="text-sm">{proyecto.ubicacion}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Building className="w-4 h-4 text-orange-500" />
                              <span className="text-sm font-medium">{proyecto.desarrolladora}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-3xl font-bold text-orange-600 mb-1">
                              {formatPrecio(proyecto.precio)}
                            </div>
                            <div className="text-sm text-gray-500">
                              ~{formatPrecio(calcularMensualidad(proyecto.precio))}/mes
                            </div>
                            <div className="flex items-center gap-1 mt-2 justify-end">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-bold text-gray-700">{proyecto.puntuacion}/10</span>
                            </div>
                          </div>
                        </div>

                        {/* Características grid */}
                        <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{proyecto.recamaras}</div>
                            <div className="text-xs text-gray-500">Recámaras</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{proyecto.banos}</div>
                            <div className="text-xs text-gray-500">Baños</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{proyecto.m2Construccion}</div>
                            <div className="text-xs text-gray-500">m² Const.</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{proyecto.plusvaliaEsperada}</div>
                            <div className="text-xs text-gray-500">Plusvalía</div>
                          </div>
                        </div>

                        {/* Ventajas y Desventajas */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" /> Ventajas
                            </h4>
                            <ul className="space-y-1">
                              {proyecto.ventajas.slice(0, 3).map((v, i) => (
                                <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                                  <span className="text-green-500 mt-0.5">✓</span>
                                  <span>{v}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" /> Desventajas
                            </h4>
                            <ul className="space-y-1">
                              {proyecto.desventajas.slice(0, 3).map((d, i) => (
                                <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                                  <span className="text-red-500 mt-0.5">✗</span>
                                  <span>{d}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => setProyectoSeleccionado(proyecto)}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl transition"
                          >
                            Ver detalles completos
                          </button>
                          <button
                            onClick={() => toggleComparacion(proyecto)}
                            className={`px-6 py-3 rounded-xl font-semibold transition ${
                              enComparacion
                                ? 'bg-orange-100 text-orange-700 border-2 border-orange-400'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            {enComparacion ? 'En comparación ✓' : 'Comparar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {proyectosFiltrados.length === 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      No se encontraron proyectos
                    </h3>
                    <p className="text-gray-500">
                      Intenta ajustar los filtros para ver más opciones
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Vista de Comparación */}
        {vistaActual === 'comparar' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
              Comparador de Proyectos
            </h2>

            {comparacion.length === 0 ? (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">
                  No has seleccionado proyectos para comparar
                </p>
                <button
                  onClick={() => setVistaActual('busqueda')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold"
                >
                  Ir a búsqueda
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 px-4 text-gray-700 font-bold">Característica</th>
                      {comparacion.map(proyecto => (
                        <th key={proyecto.id} className="py-4 px-4">
                          <div className="text-center">
                            <div className="font-bold text-gray-900 mb-2">{proyecto.nombre}</div>
                            <button
                              onClick={() => toggleComparacion(proyecto)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Eliminar
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Precio', key: 'precio', format: formatPrecio },
                      { label: 'Mensualidad', key: 'mensualidadEstimada', format: (v) => formatPrecio(v) + '/mes' },
                      { label: 'Ubicación', key: 'ubicacion' },
                      { label: 'Recámaras', key: 'recamaras' },
                      { label: 'Baños', key: 'banos' },
                      { label: 'm² Construcción', key: 'm2Construccion' },
                      { label: 'Estado', key: 'estado' },
                      { label: 'Entrega', key: 'entrega' },
                      { label: 'Plusvalía esperada', key: 'plusvaliaEsperada' },
                      { label: 'Puntuación', key: 'puntuacion', format: (v) => `${v}/10` }
                    ].map(({ label, key, format }) => (
                      <tr key={key} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold text-gray-700">{label}</td>
                        {comparacion.map(proyecto => (
                          <td key={proyecto.id} className="py-3 px-4 text-center">
                            {format ? format(proyecto[key]) : proyecto[key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Vista de Recursos */}
        {vistaActual === 'recursos' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                Recursos Útiles
              </h2>

              <div className="grid gap-4 mb-8">
                {RECURSOS.map((recurso, i) => (
                  <a
                    key={i}
                    href={recurso.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:shadow-lg transition-all group"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600">
                      {recurso.titulo} →
                    </h3>
                    <p className="text-gray-600 text-sm">{recurso.descripcion}</p>
                  </a>
                ))}
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📱 Contactos Clave
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-orange-600" />
                    <div>
                      <div className="font-semibold">Infonatel (todo México)</div>
                      <div className="text-gray-600">800 008 3900</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-orange-600" />
                    <div>
                      <div className="font-semibold">Delegación Infonavit Puebla</div>
                      <div className="text-gray-600">Blvd. Esteban de Antuñano 2701</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <div>
                      <div className="font-semibold">Horario</div>
                      <div className="text-gray-600">Lunes a viernes 8:30 - 14:30 hrs</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                Proceso para obtener Vivienda del Bienestar
              </h3>
              <div className="space-y-4">
                {[
                  { paso: 1, titulo: 'Verifica requisitos', desc: '1-2 salarios mínimos, mínimo 6 meses cotizando' },
                  { paso: 2, titulo: 'Actualiza datos', desc: 'En micuenta.infonavit.org.mx - teléfono, correo, dirección' },
                  { paso: 3, titulo: 'Consulta puntos', desc: 'Necesitas mínimo 1,080 puntos para precalificación' },
                  { paso: 4, titulo: 'Espera contacto', desc: 'Infonavit te contacta por SMS/correo/WhatsApp cuando abra proyecto' },
                  { paso: 5, titulo: 'Registra interés', desc: 'Cuando anuncien predio en Puebla, regístrate día 1' },
                  { paso: 6, titulo: 'Integra expediente', desc: 'INE, CURP, acta, comprobantes, NSS' },
                  { paso: 7, titulo: 'Selección', desc: 'Si quedas seleccionado, firma contrato y calendario de pagos' },
                  { paso: 8, titulo: 'Entrega', desc: 'Recibe tu vivienda según calendario (2026-2027)' }
                ].map(({ paso, titulo, desc }) => (
                  <div key={paso} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                      {paso}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{titulo}</div>
                      <div className="text-sm text-gray-600">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {proyectoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                    {proyectoSeleccionado.nombre}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <span>{proyectoSeleccionado.ubicacion}</span>
                  </div>
                </div>
                <button
                  onClick={() => setProyectoSeleccionado(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Características</h3>
                  <ul className="space-y-2">
                    {proyectoSeleccionado.caracteristicas.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Datos Financieros</h3>
                  <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                    <div>
                      <div className="text-sm text-gray-500">Precio total</div>
                      <div className="text-2xl font-bold text-orange-600">
                        {formatPrecio(proyectoSeleccionado.precio)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Mensualidad estimada (20 años)</div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatPrecio(calcularMensualidad(proyectoSeleccionado.precio))}/mes
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Entrega</div>
                      <div className="font-semibold text-gray-900">{proyectoSeleccionado.entrega}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Plusvalía esperada (5 años)</div>
                      <div className="font-semibold text-green-600">{proyectoSeleccionado.plusvaliaEsperada}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Ventajas
                  </h4>
                  <ul className="space-y-2">
                    {proyectoSeleccionado.ventajas.map((v, i) => (
                      <li key={i} className="text-sm text-gray-700">✓ {v}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
                  <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Desventajas
                  </h4>
                  <ul className="space-y-2">
                    {proyectoSeleccionado.desventajas.map((d, i) => (
                      <li key={i} className="text-sm text-gray-700">✗ {d}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200 mb-6">
                <h4 className="font-bold text-orange-800 mb-2">Contacto</h4>
                <p className="text-sm text-gray-700">{proyectoSeleccionado.contacto}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => toggleComparacion(proyectoSeleccionado)}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl"
                >
                  {comparacion.find(p => p.id === proyectoSeleccionado.id) ? 'Quitar de comparación' : 'Agregar a comparación'}
                </button>
                <button
                  onClick={() => setProyectoSeleccionado(null)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
