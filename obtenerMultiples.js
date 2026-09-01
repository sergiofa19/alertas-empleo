const fetch = require('node-fetch');
const obtenerRSS = require('./fuentes/rss');
const obtenerTecnoempleo = require('./fuentes/tecnoempleo');

// Palabras clave enfocas en SOC y Ciberseguridad
const PALABRAS_CLAVE = ['soc', 'siem', 'sentinel', 'ciberseguridad', 'cybersecurity', 'seguridad', 'analista', 'incident'];

function esOfertaRelevante(oferta) {
  if (!oferta || !oferta.titulo) return false;
  const texto = oferta.titulo.toLowerCase();
  return PALABRAS_CLAVE.some(keyword => texto.includes(keyword));
}

async function ejecutarOrquestador() {
  console.log('🚀 Iniciando recolección de ofertas...');
  let todasLasOfertas = [];

  // 1. Feeds RSS
  console.log('🔍 Consultando Feeds RSS...');
  const ofertasRSS = await obtenerRSS();
  todasLasOfertas.push(...ofertasRSS);

  // 2. Tecnoempleo vía Puppeteer
  console.log('🔍 Consultando Tecnoempleo...');
  const ofertasTecno = await obtenerTecnoempleo();
  todasLasOfertas.push(...ofertasTecno);

  // Filtrar ofertas por palabras clave
  const ofertasFiltradas = todasLasOfertas.filter(esOfertaRelevante);
  console.log(`\n✅ Total de ofertas relevantes filtradas: ${ofertasFiltradas.length}`);

  // Enviar a Render
  if (ofertasFiltradas.length > 0) {
    try {
      // URL real de tu servicio desplegado en Render
      const URL_RENDER = process.env.URL_BACKEND || 'https://alertas-empleo.onrender.com/actualizar';
      console.log(`📡 Enviando ofertas a ${URL_RENDER}...`);

      const res = await fetch(URL_RENDER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ofertasFiltradas)
      });

      if (res.ok) {
        console.log('🎉 Ofertas enviadas con éxito al backend.');
      } else {
        console.error(`❌ Error en respuesta del backend: ${res.status}`);
      }
    } catch (err) {
      console.error('❌ Error al enviar ofertas a Render:', err.message);
    }
  } else {
    console.log('ℹ️ No se encontraron ofertas nuevas que coincidan con los filtros.');
  }
}

ejecutarOrquestador();
