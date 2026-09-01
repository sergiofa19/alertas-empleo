import fetch from "node-fetch";

export default async function obtenerLinkedIn() {
    try {
        const url =
            "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=SOC%20Analyst&location=Spain";

        const res = await fetch(url);
        const html = await res.text();

        const ofertas = [...html.matchAll(/data-search-title="([^"]+)"/g)].map(m => ({
            titulo: m[1],
            descripcion: m[1],
            remoto: m[1].toLowerCase().includes("remote"),
            pais: "España",
            fuente: "LinkedIn"
        }));

        return ofertas;
    } catch (e) {
        console.error("Error LinkedIn:", e);
        return [];
    }
}
