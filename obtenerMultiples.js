const fetch = require('node-fetch');

// Importar fuentes existentes y nuevas
const obtenerManfred = require('./fuentes/manfred');
const obtenerRSS = require('./fuentes/rss');

// Palabras clave requeridas para filtrar las ofertas de SOC/Seguridad
const PALABRAS_CLAVE = [
  'soc',
  'siem',
  'sentinel',
  'ciberseguridad',
  'cybersecurity',
  'seguridad',
  'analista de seguridad',
  'incident response'
];

/**
 * Filtra si el título o contenido de la oferta contiene al menos una palabra clave relevante
 */
function esOfertaRelevante(oferta) {
  if (!oferta || !oferta.titulo) return false;
  const texto = oferta.titulo.toLowerCase();
  return PALABRAS_CLAVE.some(keyword => texto.includes(keyword));
}

async function ejecutarOrquestador() {
  console.log('🚀 Iniciando recolección de ofertas...');

  let todasLasOfertas = [];

  // 1. Ejecutar Manfred
  console.log('🔍 Consultando Manfred...');
  const ofertasManfred = await obtenerManfred();
  console.log(` -> Manfred devolvió ${ofertasManfred.length} ofertas raw.`);
  todasLasOfertas.push(...ofertasManfred);

  // 2. Ejecutar Feeds RSS
  console.log('🔍 Consultando Feeds RSS...');
  const ofertasRSS = await obtenerRSS();
  console.log(` -> RSS devolvió ${ofertasRSS.length} ofertas raw.`);
  todasLasOfertas.push(...ofertasRSS);

  // 3. Filtrar solo ofertas relevantes (SOC / Ciberseguridad)
  const ofertasFiltradas = todasLasOfertas.filter(esOfertaRelevante);
  console.log(`\n✅ Total de ofertas relevantes filtradas: ${ofertasFiltradas.length}`);

  // 4. Enviar payload filtrado al backend en Render
  if (ofertasFiltradas.length > 0) {
    try {
      const URL_RENDER = 'https://tu-backend.onrender.com/actualizar'; // Sustituye con tu URL real
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
