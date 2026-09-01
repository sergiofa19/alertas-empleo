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

        // Si no hay HTML, devolvemos vacío
        if (!html || html.length < 100) {
            console.log("⚠️ Tecnoempleo devolvió HTML vacío.");
            return [];
        }

        // Extraer ofertas con regex simple
        const regex = /<h2 class="titulo-oferta">(.*?)<\/h2>[\s\S]*?<p class="descripcion-oferta">(.*?)<\/p>[\s\S]*?<span class="provincia">(.*?)<\/span>/g;

        const ofertas = [];
        let match;

        while ((match = regex.exec(html)) !== null) {
            ofertas.push({
                titulo: match[1].trim(),
                descripcion: match[2].trim(),
                ubicacion: match[3].trim(),
                remoto: false,
                fuente: "Tecnoempleo"
            });
        }

        return ofertas;

    } catch (e) {
        console.error("❌ Error en Tecnoempleo:", e.message);
        return [];
    }
}
