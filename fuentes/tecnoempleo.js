import fetch from "node-fetch";

export default async function obtenerTecnoempleo() {
    try {
        const url = "https://www.tecnoempleo.com/busqueda-empleo.php?pr=1&te=seguridad";

        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "text/html"
            }
        });

        const html = await res.text();

        if (!html || html.length < 200) {
            console.log("⚠️ Tecnoempleo devolvió HTML vacío.");
            return [];
        }

        // Nuevo patrón 2026
        const regex = /<a[^>]*class="oferta-link"[^>]*>([\s\S]*?)<\/a>/g;

        const ofertas = [];
        let match;

        while ((match = regex.exec(html)) !== null) {
            const bloque = match[1];

            const titulo = (bloque.match(/<h2[^>]*>(.*?)<\/h2>/)?.[1] || "").trim();
            const descripcion = (bloque.match(/<p[^>]*class="descripcion"[^>]*>(.*?)<\/p>/)?.[1] || "").trim();
            const ubicacion = (bloque.match(/<span[^>]*class="provincia"[^>]*>(.*?)<\/span>/)?.[1] || "").trim();

            if (titulo.length > 0) {
                ofertas.push({
                    titulo,
                    descripcion,
                    ubicacion,
                    remoto: false,
                    fuente: "Tecnoempleo"
                });
            }
        }

        return ofertas;

    } catch (e) {
        console.error("❌ Error en Tecnoempleo:", e.message);
        return [];
    }
}
