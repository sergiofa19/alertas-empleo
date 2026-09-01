import fetch from "node-fetch";

const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY;

if (!JOOBLE_API_KEY) {
    console.error("❌ ERROR: Falta JOOBLE_API_KEY en GitHub Secrets.");
    process.exit(1);
}

export default async function obtenerJooble() {
    try {
        const res = await fetch(`https://jooble.org/api/${JOOBLE_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                keywords: "security analyst SOC",
                location: "España"
            })
        });

        const data = await res.json();

        if (!data || !data.jobs) {
            console.log("⚠️ Jooble devolvió un formato inesperado.");
            return [];
        }

        return data.jobs.map(job => ({
            titulo: job.title || "",
            descripcion: job.snippet || "",
            ubicacion: job.location || "",
            remoto: job.remote || false,
            fuente: "Jooble"
        }));

    } catch (e) {
        console.error("❌ Error en Jooble API:", e.message);
        return [];
    }
}
