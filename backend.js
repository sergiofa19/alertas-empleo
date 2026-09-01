import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());
app.use(cors());

const FILE = "./data.json";

// Cargar ofertas al iniciar el servidor
let ofertas = [];
if (fs.existsSync(FILE)) {
    try {
        ofertas = JSON.parse(fs.readFileSync(FILE, "utf8"));
    } catch (e) {
        ofertas = [];
    }
}

// Endpoint para actualizar ofertas desde GitHub Actions
app.post("/actualizar", (req, res) => {
    ofertas = req.body.ofertas || [];

    // Guardar en archivo para persistencia
    fs.writeFileSync(FILE, JSON.stringify(ofertas, null, 2));

    res.json({
        status: "ok",
        guardadas: ofertas.length
    });
});

// Endpoint público para mostrar ofertas
app.get("/alertas", (req, res) => {
    res.json(ofertas);
});

// Servidor
app.listen(3000, () => {
    console.log("Backend de alertas activo en puerto 3000");
});
