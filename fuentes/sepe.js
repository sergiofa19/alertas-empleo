import fetch from "node-fetch";

export default async function obtenerSEPE() {
    try {
        const url = "https://www.sepe.es/HomeSepe/Personas/encontrar-empleo/ofertas.html";
        const res = await fetch(url);
        const html = await res.text();

        const ofertas = [...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map(m => ({
            titulo: m[1].trim(),
            descripcion: m[1].trim(),
            remoto: false,
            pais: "España",
            fuente: "SEPE"
        }));

        return ofertas;
    } catch (e) {
        console.error("Error SEPE:", e);
        return [];
    }
}
