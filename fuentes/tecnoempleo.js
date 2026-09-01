const puppeteer = require('puppeteer');

async function obtenerTecnoempleo() {
  console.log('[Tecnoempleo] Iniciando Puppeteer...');
  let browser = null;
  const ofertas = [];

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Cambiado a la landing principal de ofertas para capturar más resultados
    const url = 'https://www.tecnoempleo.com/ofertas-trabajo/';
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const resultados = await page.evaluate(() => {
      const items = document.querySelectorAll('a[href*="/ofertas-trabajo/"]');
      const list = [];
      const linksVistos = new Set();

      items.forEach(linkEl => {
        const title = linkEl.innerText ? linkEl.innerText.trim() : '';
        const link = linkEl.href;

        // Filtra enlaces repetidos o enlaces de paginación estáticos
        if (
          title && 
          link && 
          title.length > 5 && 
          !link.endsWith('/ofertas-trabajo/') && 
          !linksVistos.has(link)
        ) {
          linksVistos.add(link);
          list.push({
            titulo: title,
            empresa: 'Tecnoempleo',
            ubicacion: 'España',
            enlace: link,
            fuente: 'Tecnoempleo',
            fecha: new Date().toISOString()
          });
        }
      });

      return list;
    });

    ofertas.push(...resultados);
    console.log(`[Tecnoempleo] Se encontraron ${ofertas.length} ofertas vía Puppeteer.`);

  } catch (err) {
    console.error('[Tecnoempleo] Error en scraping:', err.message);
  } finally {
    if (browser) await browser.close();
  }

  return ofertas;
}

module.exports = obtenerTecnoempleo;
