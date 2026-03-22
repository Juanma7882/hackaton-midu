// import ""
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import preguntasRoutes from "./routes/preguntas.routes.js";
import etiquetaRoutes from "./routes/etiquetas.routes.js";
import tarjetaEtiqueta from "./routes/tarjetaEtiqueta.routes.js"
import healthRoutes from "./routes/health.routes.js";
const app = express();


/* FIX PARA __dirname EN ESM */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Middlewares
app.use(cors());
app.use(express.json());

// Archivos estáticos
app.use(
  "/logos",
  express.static(path.join(__dirname, "public", "logos"))
);

// Rutas
app.use("/api/preguntas", preguntasRoutes);
app.use("/api/etiquetas", etiquetaRoutes);
app.use("/api/tarjetaEtiquetas", tarjetaEtiqueta);
app.use("/api/health", healthRoutes);

// Ruta raíz de prueba
app.get("/", (req, res) => {
  res.json({
    message: "¡Servidor funcionando correctamente!",
    api: "Visita http://localhost:3002/api/preguntas para usar la API o el frontend. http://localhost:3003/api/preguntas",
  });
});

export default app;


