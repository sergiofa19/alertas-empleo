import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Aquí guardaremos las ofertas en memoria
let ofertasFiltradas = [];

// Ruta raíz (evita "Cannot GET /")
app.get("/", (req, res) => {
    res.send("API de alertas SOC funcionando");
});

// Ruta para ver las ofertas
app.get("/alertas", (req, res) => {
    res.json(ofertasFiltradas);
});

// Ruta para actualizar las ofertas desde GitHub Actions
app.post("/actualizar", (req, res) => {
    const { ofertas } = req.body;

    if (!Array.isArray(ofertas)) {
        return res.status(400).json({ error: "Formato inválido" });
    }

    ofertasFiltradas = ofertas;
    console.log("🔄 Ofertas actualizadas. Total:", ofertasFiltradas.length);

    res.json({ ok: true });
});

// Render usa este puerto automáticamente
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🚀 Backend de alertas SOC funcionando en el puerto", PORT);
});
