const { scrapeInmuebles24 } = require('./inmuebles24');
const { scrapeVivanuncios } = require('./vivanuncios');
const { scrapeLamudi } = require('./lamudi');

module.exports = {
  inmuebles24: scrapeInmuebles24,
  vivanuncios: scrapeVivanuncios,
  lamudi: scrapeLamudi
};
