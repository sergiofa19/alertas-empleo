const fetch = require('node-fetch');
const xml2js = require('xml2js');

const FEEDS_RSS = [
  'https://wwwhatsnew.com/category/empleo/feed/',
  'https://www.getonbrd.com/jobs-rss'
];

async function obtenerRSS() {
  console.log('🔍 Consultando Feeds RSS...');
  const ofertas = [];
  const parser = new xml2js.Parser({ explicitArray: false, relaxed: true });

  for (const url of FEEDS_RSS) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        timeout: 10000
      });

      if (!response.ok) {
        console.log(`[RSS] ${url} devolvió HTTP ${response.status}`);
        continue;
      }

      let xmlText = await response.text();
      
      // Sanitizar ampersands huérfanos que rompen el parser XML
      xmlText = xmlText.replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;');

      const result = await parser.parseStringPromise(xmlText);

      const items = result?.rss?.channel?.item || result?.feed?.entry || [];
      const listaItems = Array.isArray(items) ? items : [items];

      listaItems.forEach(item => {
        const titulo = item.title?._ || item.title || '';
        const enlace = item.link?.$?.href || item.link || '';

        if (titulo && enlace) {
          ofertas.push({
            titulo: typeof titulo === 'string' ? titulo.trim() : String(titulo),
            empresa: 'RSS Feed',
            ubicacion: 'Remoto / Varios',
            enlace: typeof enlace === 'string' ? enlace.trim() : String(enlace),
            fuente: 'RSS',
            fecha: item.pubDate || new Date().toISOString()
          });
        }
      });
    } catch (err) {
      console.error(`[RSS] Error en feed ${url}:`, err.message);
    }
  }

  return ofertas;
}

module.exports = obtenerRSS;
