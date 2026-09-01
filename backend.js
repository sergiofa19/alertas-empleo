import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// --- Almacenamiento en memoria ---
let ofertasFiltradas = [];

// --- Requisitos de filtrado ---
const requisitos = {
    tecnologias: ["SIEM", "Linux", "Microsoft Sentinel"],
    experienciaMax: 2,
    remoto: true,
    pais: "España",
    ingles: "B2"
};

// --- Función principal: obtener ofertas (NO se ejecuta en Render) ---
async function obtenerOfertas() {
    try {
        const url = "https://api.infojobs.net/api/7/offer";
        const headers = {
            "Authorization": "Bearer TU_TOKEN_DE_INFOJOBS"
        };

        const res = await fetch(url, { headers });
        const data = await res.json();

        ofertasFiltradas = data.items.filter(oferta => {
            const cumpleTecnologias = requisitos.tecnologias.every(t =>
                oferta.description.toLowerCase().includes(t.toLowerCase())
            );

            const experiencia = oferta.experienceMin?.value || 0;
            const remoto = oferta.teleworking?.value === "Full-remote";
            const pais = oferta.country?.value === requisitos.pais;

            return cumpleTecnologias &&
                   experiencia <= requisitos.experienciaMax &&
                   remoto &&
                   pais;
        });

        console.log("Ofertas filtradas:", ofertasFiltradas.length);

        await fetch("https://alertas-empleo.onrender.com/actualizar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ofertas: ofertasFiltradas })
        });

    } catch (error) {
        console.error("Error obteniendo ofertas:", error);
    }
}

// --- Endpoint para recibir actualizaciones desde GitHub Actions ---
app.post("/actualizar", (req, res) => {
    try {
        ofertasFiltradas = req.body.ofertas || [];
        console.log("Ofertas actualizadas vía GitHub Actions:", ofertasFiltradas.length);
        res.send("Actualizado correctamente");
    } catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).send("Error al actualizar");
    }
});

// --- Endpoint público para tu frontend ---
app.get("/alertas", (req, res) => {
    res.json(ofertasFiltradas);
});

// --- Ruta raíz opcional ---
app.get("/", (req, res) => {
    res.send("API de alertas SOC funcionando");
});

// --- Render usa PORT dinámico ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Backend de alertas activo en puerto " + PORT);
});

// Mantener el proceso vivo para Render
setInterval(() => {
    console.log("Manteniendo backend activo...");
}, 10000);

// obtenerOfertas();  // NO ejecutar en Render
