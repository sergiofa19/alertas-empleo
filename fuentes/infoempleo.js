import fetch from "node-fetch";

export default async function obtenerInfoempleo() {
    try {
        const url =
            "https://www.infoempleo.com/trabajo/soc-analyst/en_espana/";

        const res = await fetch(url);
        const html = await res.text();

        const ofertas = [...html.matchAll(/class="oferta-titulo"[^>]*>([^<]+)</g)].map(m => ({
            titulo: m[1].trim(),
            descripcion: m[1].trim(),
            remoto: m[1].toLowerCase().includes("remoto"),
            pais: "España",
            fuente: "Infoempleo"
        }));

        return ofertas;
    } catch (e) {
        console.error("Error Infoempleo:", e);
        return [];
    }
}
