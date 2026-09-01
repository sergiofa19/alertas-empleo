import fetch from "node-fetch";
import express from "express";
import cron from "cron";

const app = express();
let ofertasFiltradas = [];

// --- Requisitos ---
const requisitos = {
    tecnologias: ["SIEM", "Linux", "Microsoft Sentinel"],
    experienciaMax: 2,
    remoto: true,
    pais: "España",
    ingles: "B2"
};

// --- Función para obtener ofertas reales ---
async function obtenerOfertas() {
    try {
        const url = "https://api.infojobs.net/api/7/offer"; // Ejemplo real
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

            return cumpleTecnologias && experiencia <= requisitos.experienciaMax && remoto && pais;
        });

        console.log("Ofertas actualizadas:", ofertasFiltradas.length);

    } catch (error) {
        console.error("Error obteniendo ofertas:", error);
    }
}

// --- Cron diario: 09:00 hora de Madrid ---
const job = new cron.CronJob(
    "0 9 * * *",
    obtenerOfertas,
    null,
    true,
    "Europe/Madrid"
);

// --- Endpoint para tu frontend ---
app.get("/alertas", (req, res) => {
    res.json(ofertasFiltradas);
});

// --- Render usa PORT dinámico ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Backend de alertas activo en puerto " + PORT);
});
