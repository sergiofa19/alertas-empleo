import fetch from "node-fetch";
import obtenerLinkedIn from "./fuentes/linkedin.js";
import obtenerIndeed from "./fuentes/indeed.js";
import obtenerJooble from "./fuentes/jooble.js";
import obtenerSEPE from "./fuentes/sepe.js";
import obtenerTecnoempleo from "./fuentes/tecnoempleo.js";
import obtenerInfoempleo from "./fuentes/infoempleo.js";

const requisitos = {
    tecnologias: ["SIEM", "Linux", "Microsoft Sentinel", "Azure", "Active Directory"],
    remoto: true,
    pais: "España",
    ciudades: ["madrid", "barcelona", "sevilla", "valencia", "españa"]
};

// Pre-calculamos las tecnologías en minúsculas una sola vez
const tecnologiasLower = requisitos.tecnologias.map(t => t.toLowerCase());

function filtrar(ofertas) {
    return ofertas.filter(oferta => {
        // Normalizamos los textos comprobando nulos o indefinidos
        const desc = (oferta.descripcion || "").toLowerCase();
        const titulo = (oferta.titulo || "").toLowerCase();
        const textoCompleto = `${titulo} ${desc}`;
        const paisOferta = (oferta.pais || "").toLowerCase();

        // 1. Validar País / Ubicación
        const esPaisValido = paisOferta === requisitos.pais.toLowerCase() ||
                             requisitos.ciudades.some(ciudad => textoCompleto.includes(ciudad));

        if (!esPaisValido) return false;

        // 2. Validar Remoto
        const esRemoto = oferta.remoto === true ||
                         textoCompleto.includes("remoto") ||
                         textoCompleto.includes("remote") ||
                         textoCompleto.includes("teletrabajo");

        // 3. Validar Tecnologías
        const tieneTecnologia = tecnologiasLower.some(tec => textoCompleto.includes(tec));

        // Aceptar si cumple país/ubicación Y (remoto O alguna tecnología)
        return esRemoto || tieneTecnologia;
    });
}

async function main() {
    console.log("🔍 Obteniendo ofertas desde todas las fuentes...");

    // Mapa de fuentes para auditar en logs si alguna falla
    const fuentesMap = [
        { nombre: "LinkedIn", fn: obtenerLinkedIn },
        { nombre: "Indeed", fn: obtenerIndeed },
        { nombre: "Jooble", fn: obtenerJooble },
        { nombre: "SEPE", fn: obtenerSEPE },
        { nombre: "Tecnoempleo", fn: obtenerTecnoempleo },
        { nombre: "Infoempleo", fn: obtenerInfoempleo }
    ];

    // Ejecutamos en paralelo pero aislamos fallos con Promise.allSettled
    const resultados = await Promise.allSettled(
        fuentesMap.map(async ({ nombre, fn }) => {
            try {
                const ofertas = await fn();
                return Array.isArray(ofertas) ? ofertas : [];
            } catch (err) {
                console.warn(`⚠️ Error en la fuente [${nombre}]:`, err.message || err);
                return []; // Si falla, retornamos array vacío para no tirar el proceso
            }
        })
    );

    // Extraemos solo los resultados exitosos
    const todas = resultados
        .filter(res => res.status === "fulfilled")
        .flatMap(res => res.value);

    console.log("📌 Total ofertas obtenidas (sin errores de red):", todas.length);

    const filtradas = filtrar(todas);
    console.log("🎯 Ofertas filtradas:", filtradas.length);

    if (filtradas.length === 0) {
        console.log("⚠️ No hay ofertas para enviar a Render.");
        return;
    }

    // Envío a Render con manejo explícito del status HTTP
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
