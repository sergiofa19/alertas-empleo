import fetch from "node-fetch";
import obtenerJooble from "./fuentes/jooble.js";

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

function filtrar(ofertas) {
    return ofertas.filter(oferta => {
        const texto = `${oferta.titulo} ${oferta.descripcion} ${oferta.ubicacion}`.toLowerCase();

        const esEspaña = ciudades.some(c => texto.includes(c));
        const esSOC = tecnologias.some(t => texto.includes(t));

        return esEspaña && esSOC;
    });
}

async function main() {
    console.log("🔍 Obteniendo ofertas desde Jooble API...");

    const ofertas = await obtenerJooble();

    console.log("📌 Total ofertas obtenidas:", ofertas.length);

    console.log("🟦 OFERTAS SIN FILTRAR:");
    console.log(JSON.stringify(ofertas, null, 2));

    const filtradas = filtrar(ofertas);

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
