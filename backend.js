import express from "express";

const app = express();
app.use(express.json());

// Aquí guardamos las ofertas que envía GitHub Actions
let ofertasFiltradas = [];

// Endpoint donde GitHub Actions envía las ofertas ya filtradas
app.post("/actualizar", (req, res) => {
    try {
        ofertasFiltradas = req.body.ofertas || [];
        console.log("Ofertas actualizadas:", ofertasFiltradas.length);
        res.send("Actualizado correctamente");
    } catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).send("Error al actualizar");
    }
});

// Endpoint público para ver las ofertas
app.get("/alertas", (req, res) => {
    res.json(ofertasFiltradas);
});

// Página principal
app.get("/", (req, res) => {
    res.send("API de alertas SOC funcionando");
});

// Render asigna el puerto automáticamente
const PORT = process.env.PORT || 3000;

// Arrancar servidor
app.listen(PORT, () => {
    console.log("Backend de alertas activo en puerto " + PORT);
});

// Mantener el proceso vivo en Render
setInterval(() => {
    console.log("Manteniendo backend activo...");
}, 10000);

// IMPORTANTE: NO ejecutar obtenerOfertas() aquí
// GitHub Actions ejecuta obtenerMultiples.js
