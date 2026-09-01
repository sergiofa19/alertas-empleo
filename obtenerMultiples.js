import fetch from "node-fetch";

// ===============================
// IMPORTAR TODAS LAS FUENTES
// ===============================

// Estas están desactivadas porque devuelven vacío o errores
// import obtenerLinkedIn from "./fuentes/linkedin.js";
// import obtenerIndeed from "./fuentes/indeed.js";
// import obtenerJooble from "./fuentes/jooble.js";
// import obtenerSEPE from "./fuentes/sepe.js";
// import obtenerInfoempleo from "./fuentes/infoempleo.js";

// Esta es la única que funciona hoy
import obtenerTecnoempleo from "./fuentes/tecnoempleo.js";

// ===============================
// CONFIGURACIÓN
// ===============================

const tecnologias = [
    "siem",
    "sentinel",
    "azure",
    "linux",
    "active directory",
    "splunk",
    "qradar",
    "soc",
    "cyber",
    "security"
];

const ciudades = ["madrid", "barcelona", "sevilla", "valencia", "españa"];

// ===============================
// FILTRO SOC
// ===============================

function filtrar(ofertas) {
    return ofertas.filter(oferta => {
        const texto = `${oferta.titulo} ${oferta.descripcion} ${oferta.ubicacion}`.toLowerCase();

        const esEspaña = ciudades.some(c => texto.includes(c));
        const esSOC = tecnologias.some(t => texto.includes(t));

        return esEspaña && esSOC;
    });
}

// ===============================
// MAIN
// ===============================

async function main() {
    console.log("🔍 Obteniendo ofertas desde fuentes disponibles...");

    const fuentesMap = [
        // { nombre: "LinkedIn", fn: obtenerLinkedIn },
        // { nombre: "Indeed", fn: obtenerIndeed },
        // { nombre: "Jooble", fn: obtenerJooble },
        // { nombre: "SEPE", fn: obtenerSEPE },
        // { nombre: "Infoempleo", fn: obtenerInfoempleo },

        // ÚNICA FUENTE FUNCIONAL HOY:
        { nombre: "Tecnoempleo", fn: obtenerTecnoempleo }
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
        console.log("⚠️ No hay ofertas SOC para enviar.");
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

        console.log("✅ Ofertas SOC enviadas a Render correctamente.");
    } catch (e) {
        console.error("❌ Error al enviar datos a Render:", e.message);
        process.exit(1);
    }
}

main();
