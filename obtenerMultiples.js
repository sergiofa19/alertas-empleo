import fetch from "node-fetch";
import obtenerLinkedIn from "./fuentes/linkedin.js";
import obtenerIndeed from "./fuentes/indeed.js";
import obtenerJooble from "./fuentes/jooble.js";
import obtenerSEPE from "./fuentes/sepe.js";
import obtenerTecnoempleo from "./fuentes/tecnoempleo.js";
import obtenerInfoempleo from "./fuentes/infoempleo.js";

const requisitos = {
    tecnologias: ["SIEM", "Linux", "Microsoft Sentinel", "Azure", "Active Directory"],
    ciudades: ["madrid", "barcelona", "sevilla", "valencia", "españa"]
};

const tecnologiasLower = requisitos.tecnologias.map(t => t.toLowerCase());

function filtrar(ofertas) {
    return ofertas.filter(oferta => {
        const desc = (oferta.descripcion || "").toLowerCase();
        const titulo = (oferta.titulo || "").toLowerCase();
        const ubicacion = (oferta.ubicacion || "").toLowerCase();
        const textoCompleto = `${titulo} ${desc} ${ubicacion}`;

        const esPaisValido =
            requisitos.ciudades.some(ciudad => textoCompleto.includes(ciudad));

        if (!esPaisValido) return false;

        const esRemoto =
            textoCompleto.includes("remoto") ||
            textoCompleto.includes("remote") ||
            textoCompleto.includes("teletrabajo");

        const tieneTecnologia =
            tecnologiasLower.some(tec => textoCompleto.includes(tec));

        const esSOC =
            titulo.includes("soc") ||
            titulo.includes("security") ||
            titulo.includes("seguridad") ||
            titulo.includes("cyber") ||
            desc.includes("soc") ||
            desc.includes("security") ||
            desc.includes("seguridad") ||
            desc.includes("cyber");

        return esSOC && (esRemoto || tieneTecnologia);
    });
}

async function main() {
    console.log("🔍 Obteniendo ofertas desde todas las fuentes...");

    const fuentesMap = [
        { nombre: "LinkedIn", fn: obtenerLinkedIn },
        { nombre: "Indeed", fn: obtenerIndeed },
        { nombre: "Jooble", fn: obtenerJooble },
        { nombre: "SEPE", fn: obtenerSEPE },
        { nombre: "Tecnoempleo", fn: obtenerTecnoempleo },
        { nombre: "Infoempleo", fn: obtenerInfoempleo }
    ];

    const resultados = await Promise.allSettled(
        fuentesMap.map(async ({ nombre, fn }) => {
            try {
                const ofertas = await fn();
                return Array.isArray(ofertas) ? ofertas : [];
            } catch (err) {
                console.warn(`⚠️ Error en la fuente [${nombre}]:`, err.message || err);
                return [];
            }
        })
    );

    const todas = resultados
        .filter(res => res.status === "fulfilled")
        .flatMap(res => res.value);

    console.log("📌 Total ofertas obtenidas:", todas.length);

    console.log("🟦 OFERTAS SIN FILTRAR:");
    console.log(JSON.stringify(todas, null, 2));

    const filtradas = filtrar(todas);
    console.log("🎯 Ofertas filtradas:", filtradas.length);

    if (filtradas.length === 0) {
        console.log("⚠️ No hay ofertas para enviar a Render.");
        return;
    }

    try {
        const response = await fetch("https://alertas-empleo.onrender.com/actualizar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ofertas: filtradas })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error Status: ${response.status} ${response.statusText}`);
        }

        console.log("✅ Ofertas enviadas a Render correctamente.");
    } catch (e) {
        console.error("❌ Error al enviar datos al servidor de Render:", e.message);
        process.exit(1);
    }
}

main();
