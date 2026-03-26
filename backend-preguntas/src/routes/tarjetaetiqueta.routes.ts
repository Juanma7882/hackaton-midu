import { traerPreguntasPorNombreEtiqueta, asignarEtiquetaATarjeta, listarTarjetasPorEtiquetaPorNombre } from "../controllers/tarjetaEtiquetaController.js";

import { Router } from "express";

const router = Router();
router.post("/", asignarEtiquetaATarjeta);
router.get("/", listarTarjetasPorEtiquetaPorNombre);
router.get("/:nombreEtiqueta", traerPreguntasPorNombreEtiqueta);
export default router;
