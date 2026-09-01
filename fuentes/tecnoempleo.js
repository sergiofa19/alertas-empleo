import fetch from "node-fetch";

export default async function obtenerTecnoempleo() {
    try {
        const url =
            "https://www.tecnoempleo.com/busqueda-empleo.php?te=SOC+Analyst&prov=España";

        const res = await fetch(url);
        const html = await res.text();

        const ofertas = [...html.matchAll(/class="ofertaTitulo"[^>]*>([^<]+)</g)].map(m => ({
            titulo: m[1].trim(),
            descripcion: m[1].trim(),
            remoto: m[1].toLowerCase().includes("remoto"),
            pais: "España",
            fuente: "Tecnoempleo"
        }));

        return ofertas;
    } catch (e) {
        console.error("Error Tecnoempleo:", e);
        return [];
    }
}
