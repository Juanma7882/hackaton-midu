import { Router } from "express";
import {
  evaluarRespuestasConIA,
  generarResumenQuizConIA,
  streamLocalChat,
} from "../controllers/evaluacionesController.js";

const router = Router();

router.post("/openrouter", evaluarRespuestasConIA);
router.post("/openrouter/resumen-quiz", generarResumenQuizConIA);
router.post("/openrouter/stream", streamLocalChat);

export default router;
