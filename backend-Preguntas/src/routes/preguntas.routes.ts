import { Router } from "express";
import {crearPregunta,listarPreguntar, eliminarPregunta } from "../controllers/PreguntasController.js";

const router = Router();
console.log("help")
router.post("/", crearPregunta);
router.get("/", listarPreguntar);
router.delete("/:id", eliminarPregunta);

export default router;
