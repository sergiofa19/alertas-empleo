import fetch from "node-fetch";
import express from "express";

const app = express();
app.use(express.json()); // Necesario para leer JSON en POST

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

        console.log("Ofertas obtenidas:", ofertasFiltradas.length);

        // --- Enviar las ofertas a tu backend en Render (si lo ejecuta GitHub Actions) ---
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
        ofertasFiltradas = req.body.ofertas;
        console.log("Ofertas actualizadas vía GitHub Actions:", ofertasFiltradas.length);
        res.send("Actualizado correctamente");
    } catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).send("Error al actualizar");
    }
});

// --- Endpoint público para tu frontend
