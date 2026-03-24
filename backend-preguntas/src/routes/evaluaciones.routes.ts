import { Router } from "express";
import { evaluarRespuestasConOpenRouter, streamOpenRouterChat } from "../controllers/evaluacionesController.js";

const router = Router();

router.post("/openrouter", evaluarRespuestasConOpenRouter);
router.post("/openrouter/stream", streamOpenRouterChat);

export default router;
