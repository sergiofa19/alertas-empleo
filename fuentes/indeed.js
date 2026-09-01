import fetch from "node-fetch";

export default async function obtenerIndeed() {
    try {
        const url = "https://es.indeed.com/jobs?q=SOC+Analyst&l=España";
        const res = await fetch(url);
        const html = await res.text();

        const ofertas = [...html.matchAll(/"jobTitle":"([^"]+)"/g)].map(m => ({
            titulo: m[1],
            descripcion: m[1],
            remoto: m[1].toLowerCase().includes("remote"),
            pais: "España",
            fuente: "Indeed"
        }));

        return ofertas;
    } catch (e) {
        console.error("Error Indeed:", e);
        return [];
    }
}
