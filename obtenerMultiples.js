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
    pais: "España"
};

// FILTRO RELAJADO
function filtrar(ofertas) {
    return ofertas.filter(oferta => {
        const desc = (oferta.descripcion || "").toLowerCase();

        const remoto = oferta.remoto === true;
        const pais = oferta.pais === requisitos.pais;

        // Basta con que aparezca UNA tecnología
        const algunaTecnologia = requisitos.tecnologias.some(t =>
            desc.includes(t.toLowerCase())
        );

        // Si no aparece ninguna tecnología, igualmente la aceptamos
        return remoto && pais && (algunaTecnologia || true);
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

