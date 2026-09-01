const fetch = require('node-fetch');

/**
 * Obtiene ofertas de empleo desde la API pública de Manfred
 * @returns {Promise<Array>} Lista de ofertas normalizadas
 */
async function obtenerManfred() {
  try {
    const url = 'https://api.getmanfred.com/v1/jobs';
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`[Manfred] Error HTTP: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const jobs = Array.isArray(data) ? data : (data.jobs || []);

    return jobs.map(job => ({
      titulo: job.title || 'Sin título',
      empresa: job.company?.name || 'Manfred',
      ubicacion: job.location?.city || job.modality || 'España / Remoto',
      enlace: job.url || `https://www.getmanfred.com/ofertas-empleo/${job.slug || ''}`,
      fuente: 'Manfred',
      fecha: job.publishedAt || new Date().toISOString()
    }));

  } catch (error) {
    console.error('[Manfred] Error al consultar la fuente:', error.message);
    return [];
  }
}

module.exports = obtenerManfred;
