import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// --- Almacenamiento en memoria ---
let ofertasFiltradas = [];

// --- Requisitos de filtrado (solo usados por GitHub Actions) ---
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
        // ⚠️ GitHub Actions debe poner aquí tu token real
        const url = "https://api.infojobs.net/api/7/offer";
        const headers = {
            "Authorization": "Bearer TU_TOKEN_DE_INFOJOBS"
        };

        const res = await fetch(url, { headers });
        const data = await res.json();

        // --- Filtrado ---
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

