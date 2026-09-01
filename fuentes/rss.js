const fetch = require('node-fetch');
const xml2js = require('xml2js');

const parser = new xml2js.Parser({ explicitArray: false });

/**
 * Agregador de Feeds RSS de empleo
 * @returns {Promise<Array>} Lista de ofertas de fuentes RSS
 */
async function obtenerRSS() {
  const ofertas = [];

  // Lista de Feeds RSS de empleo públicos y accesibles en España/Remoto
  const feeds = [
    {
      nombre: 'WWWhatsnew Empleo',
      url: 'https://www.wwwhatsnew.com/category/empleo/feed/'
    },
    {
      nombre: 'OpciónEmpleo RSS',
      url: 'https://www.opcionempleo.com/rss?s=seguridad+soc&l=España'
    }
  ];

  for (const feed of feeds) {
    try {
      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 8000
      });

      if (!response.ok) continue;

      const xmlText = await response.text();
      const result = await parser.parseStringPromise(xmlText);

      const items = result?.rss?.channel?.item || result?.feed?.entry || [];
      const itemsArray = Array.isArray(items) ? items : [items];

      for (const item of itemsArray) {
        if (!item) continue;

        ofertas.push({
          titulo: item.title?._ || item.title || 'Sin título',
          empresa: item['dc:creator'] || 'Desconocida',
          ubicacion: 'España / Remoto',
          enlace: item.link?._ || item.link || '',
          fuente: feed.nombre,
          fecha: item.pubDate || new Date().toISOString()
        });
      }
    } catch (err) {
      console.error(`[RSS] Error en feed ${feed.nombre}:`, err.message);
    }
  }

  return ofertas;
}

module.exports = obtenerRSS;
