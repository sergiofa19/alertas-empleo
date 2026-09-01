const puppeteer = require('puppeteer');

async function obtenerTecnoempleo() {
  console.log('[Tecnoempleo] Iniciando Puppeteer...');
  let browser = null;
  const ofertas = [];

  try {
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    const url = 'https://www.tecnoempleo.com/busqueda-empleo.pro?te=soc';
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const resultados = await page.evaluate(() => {
      const items = document.querySelectorAll('.card-body, .item-oferta');
      const list = [];

      items.forEach(el => {
        const linkEl = el.querySelector('a[href*="/ofertas-trabajo/"]');
        const title = linkEl ? linkEl.innerText.trim() : '';
        const link = linkEl ? linkEl.href : '';
        const companyEl = el.querySelector('.text-primary, .empresa');
        const company = companyEl ? companyEl.innerText.trim() : 'Tecnoempleo';

        if (title && link) {
          list.push({
            titulo: title,
            empresa: company,
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
