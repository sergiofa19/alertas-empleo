import fetch from "node-fetch";
import obtenerLinkedIn from "./fuentes/linkedin.js";
import obtenerIndeed from "./fuentes/indeed.js";
import obtenerJooble from "./fuentes/jooble.js";
import obtenerSEPE from "./fuentes/sepe.js";
import obtenerTecnoempleo from "./fuentes/tecnoempleo.js";
import obtenerInfoempleo from "./fuentes/infoempleo.js";

// Tecnologías deseadas (no obligatorias)
const requisitos = {
    tecnologias: ["SIEM", "Linux", "Microsoft Sentinel", "Azure", "Active Directory"],
    remoto: true,
    pais: "España"
};

// FILTRO CORREGIDO Y REALISTA
function filtrar(ofertas) {
    return ofertas.filter(oferta => {
        const desc = (oferta.descripcion || "").toLowerCase();

        // Remoto y país siguen siendo obligatorios
        const remoto = oferta.remoto === true;
        const pais = oferta.pais === requisitos.pais;

        // Ahora basta con que aparezca UNA tecnología
        const algunaTecnologia = requisitos.tecnologias.some(t =>
            desc.includes(t.toLowerCase())
        );

        return remoto && pais && algunaTecnologia;
    });
}

async function main() {
    try {
        console.log("🔍 Obteniendo ofertas desde todas las fuentes...");

        const fuentes = [
            obtenerLinkedIn(),
            obtenerIndeed(),
            obtenerJooble(),
            obtenerSEPE(),
            obtenerTecnoempleo(),
            obtenerInfoempleo()
        ];

        const resultados = await Promise.all(fuentes);
        const todas = resultados.flat();

        console.log("📌 Total ofertas obtenidas:", todas.length);

        const filtradas = filtrar(todas);

        console.log("🎯 Ofertas filtradas:", filtradas.length);

        // Enviar al backend en Render
        await fetch("https://alertas-empleo.onrender.com/actualizar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ofertas: filtradas })
        });

        console.log("✅ Enviadas a Render correctamente");
    } catch (e) {
        console.error("❌ Error en obtenerMultiples:", e);
        process.exit(1);
    }
}

main();
