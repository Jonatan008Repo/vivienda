module.exports = [
  {
    id: 'inmuebles24',
    name: 'Inmuebles24 Puebla',
    enabled: false, // bloqueado con 403
    scraper: 'inmuebles24',
    type: 'desarrollo_nuevo',
    url: 'https://www.inmuebles24.com/venta/puebla.html',
    filters: {
      precioMin: 600000,
      precioMax: 1500000
    }
  },
  {
    id: 'vivanuncios',
    name: 'Vivanuncios Puebla',
    enabled: false, // bloqueado con 403
    scraper: 'vivanuncios',
    type: 'desarrollo_nuevo',
    url: 'https://www.vivanuncios.com.mx/s-casas-en-venta/puebla/v1c1293l10244p1',
    filters: {
      precioMin: 600000,
      precioMax: 1500000
    }
  },
  {
    id: 'lamudi_casas',
    name: 'Lamudi Casas Puebla',
    enabled: true,
    scraper: 'lamudi',
    type: 'desarrollo_nuevo',
    url: 'https://www.lamudi.com.mx/puebla/casas/for-sale/',
    pages: 5,
    filters: {
      precioMin: 600000,
      precioMax: 1500000
    }
  },
  {
    id: 'lamudi_depas',
    name: 'Lamudi Departamentos Puebla',
    enabled: true,
    scraper: 'lamudi',
    type: 'desarrollo_nuevo',
    url: 'https://www.lamudi.com.mx/puebla/departamentos/for-sale/',
    pages: 3,
    filters: {
      precioMin: 600000,
      precioMax: 1500000
    }
  }
];
