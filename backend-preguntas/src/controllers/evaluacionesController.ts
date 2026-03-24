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

export const streamOpenRouterChat = async (req: Request, res: Response) => {
    try {
        const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
        const model = typeof req.body?.model === "string" ? req.body.model : undefined;
        const temperature = typeof req.body?.temperature === "number" ? req.body.temperature : undefined;

        if (messages.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Debes enviar al menos un mensaje para abrir el stream",
                data: null,
                error: null,
            });
        }

        const { stream, model: modeloUsado } = await openRouterEvaluationService.crearStreamChat({
            messages,
            model,
            temperature,
        });

        res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");

        res.write(`event: meta\ndata: ${JSON.stringify({ model: modeloUsado })}\n\n`);

        const reader = stream.getReader();
        const decoder = new TextDecoder();

        req.on("close", async () => {
            try {
                await reader.cancel();
            } catch {
                // ignore cancellation errors
            }
        });

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            const chunk = decoder.decode(value, { stream: true });
            res.write(chunk);
        }

        res.end();
    } catch (error: any) {
        console.error("Error al abrir stream con OpenRouter:", error);

        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: "No se pudo iniciar el stream con OpenRouter",
                data: null,
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }

        res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
        res.end();
    }
};
