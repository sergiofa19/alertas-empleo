import fetch from "node-fetch";

export default async function obtenerJooble() {
    try {
        const url = "https://es.jooble.org/SearchResult?rgn=España&ukw=SOC+Analyst";
        const res = await fetch(url);
        const html = await res.text();

        const ofertas = [...html.matchAll(/class="position"[^>]*>([^<]+)</g)].map(m => ({
            titulo: m[1].trim(),
            descripcion: m[1].trim(),
            remoto: m[1].toLowerCase().includes("remote"),
            pais: "España",
            fuente: "Jooble"
        }));

        return ofertas;
    } catch (e) {
        console.error("Error Jooble:", e);
        return [];
    }
}
