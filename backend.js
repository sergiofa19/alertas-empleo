const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middlewares para procesar JSON y servir archivos estáticos
app.use(express.json());
app.use(express.static(__dirname));

// Endpoint para recibir las ofertas desde GitHub Actions
app.post('/actualizar', (req, res) => {
  try {
    const nuevasOfertas = req.body;

    if (!Array.isArray(nuevasOfertas)) {
      return res.status(400).json({ error: 'El cuerpo debe ser un array de ofertas.' });
    }

    // Guardar en data.json
    fs.writeFileSync(DATA_FILE, JSON.stringify(nuevasOfertas, null, 2), 'utf-8');
    console.log(`[Backend] Se han guardado ${nuevasOfertas.length} ofertas en data.json`);

    return res.status(200).json({ status: 'ok', guardadas: nuevasOfertas.length });
  } catch (error) {
    console.error('[Backend] Error al guardar ofertas:', error.message);
    return res.status(500).json({ error: 'Error interno guardando ofertas.' });
  }
});

// Endpoint para obtener las ofertas en la web
app.get('/api/ofertas', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.json([]);
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return res.json(JSON.parse(data || '[]'));
  } catch (error) {
    return res.status(500).json({ error: 'Error leyendo datos.' });
  }
});

// Servir la página web en la raíz o en /alertas
app.get(['/', '/alertas'], (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
});
