import { Router } from "express";
import { evaluarRespuestasConOpenRouter } from "../controllers/evaluacionesController.js";

const router = Router();

router.post("/openrouter", evaluarRespuestasConOpenRouter);

export default router;
