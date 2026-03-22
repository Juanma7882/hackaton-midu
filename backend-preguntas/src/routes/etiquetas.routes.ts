import { crearEtiqueta, mostrarEtiquetas, buscarEtiqueta, eliminarEtiqueta } from "../controllers/etiquetasController.js";
import { Router } from "express";

let router = Router()

router.post("/", crearEtiqueta)
router.get("/", mostrarEtiquetas)
router.get("/:nombre", buscarEtiqueta)
router.delete("/:id", eliminarEtiqueta)

export default router;
