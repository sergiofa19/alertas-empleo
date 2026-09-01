const fetch = require('node-fetch');

/**
 * Obtiene ofertas de empleo desde la API pública de Manfred
 */
async function obtenerManfred() {
  try {
    // Usamos el endpoint de la API de ofertas
    const url = 'https://api.getmanfred.com/offers';
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`[Manfred] Error HTTP: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const jobs = Array.isArray(data) ? data : (data.offers || data.jobs || []);

    return jobs.map(job => ({
      titulo: job.title || job.name || 'Sin título',
      empresa: job.company?.name || 'Manfred',
      ubicacion: job.location?.city || job.modality || 'España / Remoto',
      enlace: job.publicUrl || job.url || `https://www.getmanfred.com/ofertas-empleo/${job.slug || ''}`,
      fuente: 'Manfred',
      fecha: job.publishedAt || job.createdAt || new Date().toISOString()
    }));

  } catch (error) {
    console.error('[Manfred] Error al consultar la fuente:', error.message);
    return [];
  }
}

module.exports = obtenerManfred;
