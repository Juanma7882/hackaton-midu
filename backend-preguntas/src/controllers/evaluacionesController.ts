import { Request, Response } from "express";
import openRouterEvaluationService from "../services/openRouterEvaluationService.js";

export const evaluarRespuestasConOpenRouter = async (req: Request, res: Response) => {
    try {
        const preguntas = Array.isArray(req.body?.preguntas) ? req.body.preguntas : [];

        if (preguntas.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Debes enviar al menos una pregunta para evaluar",
                data: null,
                error: null,
            });
        }

        const resultado = await openRouterEvaluationService.evaluarPreguntas(preguntas);

        return res.status(200).json({
            success: true,
            message: "Evaluacion completada correctamente",
            data: resultado,
            error: null,
        });
    } catch (error: any) {
        console.error("Error al evaluar respuestas con OpenRouter:", error);
        return res.status(500).json({
            success: false,
            message: "No se pudo evaluar las respuestas con OpenRouter",
            data: null,
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
