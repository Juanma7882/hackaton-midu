import { Router } from "express";
import { obtenerMazoEspecificoConSusPreguntasYEtiquetas, obtenerMazosConSusEtiquetas } from "../controllers/mazoEtiquetasController.js"

const router = Router();
router.get("/", obtenerMazosConSusEtiquetas);
router.get("/:id", obtenerMazoEspecificoConSusPreguntasYEtiquetas);

export default router