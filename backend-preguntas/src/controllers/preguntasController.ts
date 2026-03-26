import { Request, Response } from "express";
import tarjeta from "../services/preguntaService.js"

// crearPregunta
// listarPreguntar
// eliminarPregunta

export const crearPregunta = async (req: Request, res: Response) => {
    try {
        const { pregunta, respuesta, dificultad, etiquetas } = req.body;
        const nuevaPregunta = await tarjeta.crear(pregunta, respuesta, dificultad);
        return res.status(201).json({
            success: true,
            message: "Pregunta creada correctamente",
            data: nuevaPregunta,
            error: null
        });
    } catch (error: any) {
        console.error("Error al crear pregunta:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
            data: null
        });
    }
};

export const listarPreguntar = async (req: Request, res: Response) => {

    try {
        const respuesta = await tarjeta.listar();
        return res.status(200).json({
            success: true,
            message: "Preguntas obtenidas correctamente",
            count: respuesta.length,
            data: respuesta,
            error: null
        })

    } catch (error: any) {
        console.error("Error al obtener preguntas:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
            data: null
        });
    }
}


export const eliminarPregunta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const idNum = Number(id);
        if (isNaN(idNum)) {
            return res.status(400).json({
                success: false,
                message: "El id debe ser un número válido",
                data: null
            });
        }
        const respuesta = await tarjeta.eliminar(idNum);
        return res.status(200).json({
            success: true,
            message: "Pregunta eliminada correctamente",
            count: respuesta,
            data: respuesta,
            error: null
        })

    } catch (error: any) {
        console.error("Error al obtener preguntas:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
            data: null
        });
    }
}

