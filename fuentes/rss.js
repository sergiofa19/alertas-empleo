const fetch = require('node-fetch');
const xml2js = require('xml2js');

const parser = new xml2js.Parser({ explicitArray: false });

async function obtenerRSS() {
  const ofertas = [];

  // Feeds con URLs corregidas y estables
  const feeds = [
    {
      nombre: 'Tecnoempleo RSS',
      url: 'https://www.tecnoempleo.com/rss-ofertas-trabajo.portal'
    },
    {
      nombre: 'WWWhatsnew Empleo',
      url: 'https://wwwwwwhatsnew.com/category/empleo/feed/' // Sin www para evitar error de certificado SSL
    }
  ];

  for (const feed of feeds) {
    try {
      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      if (!response.ok) {
        console.error(`[RSS] ${feed.nombre} devolvió HTTP ${response.status}`);
        continue;
      }

      const xmlText = await response.text();
      const result = await parser.parseStringPromise(xmlText);

      const channel = result?.rss?.channel || result?.feed;
      const items = channel?.item || channel?.entry || [];
      const itemsArray = Array.isArray(items) ? items : [items];

      for (const item of itemsArray) {
        if (!item) continue;

        ofertas.push({
          titulo: item.title?._ || item.title || 'Sin título',
          empresa: item['dc:creator'] || item.author?.name || 'Desconocida',
          ubicacion: 'España / Remoto',
          enlace: item.link?._ || item.link || item.guid?._ || item.guid || '',
          fuente: feed.nombre,
          fecha: item.pubDate || item.updated || new Date().toISOString()
        });
      }
    } catch (err) {
      console.error(`[RSS] Error en feed ${feed.nombre}:`, err.message);
    }
  }

  return ofertas;
}

module.exports = obtenerRSS;
