import { Router } from "express";
import {crearPregunta,listarPreguntar, eliminarPregunta } from "../controllers/preguntasController.js";

const router = Router();
router.post("/", crearPregunta);
router.get("/", listarPreguntar);
router.delete("/:id", eliminarPregunta);

export default router;
