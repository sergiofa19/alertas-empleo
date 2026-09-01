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

        // 1. Validar España por ubicación REAL
        const esPaisValido =
            requisitos.ciudades.some(ciudad => textoCompleto.includes(ciudad));

        if (!esPaisValido) return false;

        // 2. Detectar remoto (opcional)
        const esRemoto =
            textoCompleto.includes("remoto") ||
            textoCompleto.includes("remote") ||
            textoCompleto.includes("teletrabajo");

        // 3. Detectar tecnologías (opcional)
        const tieneTecnologia =
            tecnologiasLower.some(tec => textoCompleto.includes(tec));

        // 4. Detectar SOC real
        const esSOC =
            titulo.includes("soc") ||
            titulo.includes("security") ||
            titulo.includes("seguridad") ||
            titulo.includes("cyber") ||
            desc.includes("soc") ||
            desc.includes("security") ||
            desc.includes("seguridad") ||
            desc.includes("cyber");

        // Aceptar si es SOC y está en España
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
        fuentesMap.map(async
