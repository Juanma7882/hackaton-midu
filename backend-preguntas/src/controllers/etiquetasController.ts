import { Request, Response } from "express";
import EtiquetaService from "../services/etiquetaService.js";

// ---------------------------------------------------------------------
// Crear etiqueta
// mostrar etiquetas
// buscar etiqueta por nombre
// eliminar etiqueta
// ---------------------------------------------------------------------
const crearEtiqueta = async (req: Request, res: Response) => {
    try {
        const { nombre, url } = req.body;

        if (!nombre || !url) {
            return res.status(400).json({
                success: false,
                message: "Los campos 'nombre' y 'url' son obligatorios",
                data: null
            });
        }

        const etiquetas = await EtiquetaService.crear(nombre, url);

        return res.status(201).json({
            success: true,
            message: "Etiqueta creada correctamente",
            data: etiquetas,
            error: null
        });
    } catch (error: any) {
        console.error("Error al crear etiqueta:", error);

        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
            data: null
        });
    }
};


const mostrarEtiquetas = async (req: Request, res: Response) => {
    try {
        const etiquetas = await EtiquetaService.listar();

        return res.status(200).json({
            success: true,
            message: "Etiquetas obtenidas correctamente",
            count: etiquetas.length,
            data: etiquetas,
            error: null
        });
    } catch (error: any) {
        console.error("Error al obtener etiquetas:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
            data: null
        });
    }
};


const buscarEtiqueta = async (req: Request, res: Response) => {
    try {
        const { nombre } = req.params;
        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: "El nombre de la etiqueta es obligatorio",
                data: null
            });
        }

        const etiqueta = await EtiquetaService.buscarEtiquetaPorNombre(nombre);

        if (!etiqueta) {
            return res.status(404).json({
                success: false,
                message: "Etiqueta no encontrada",
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: "Etiqueta encontrada",
            data: etiqueta,
            error: null
        });

    } catch (error: any) {
        console.error("Error al buscar etiqueta:", error);

        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
            data: null
        });
    }
};


const eliminarEtiqueta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const idNum = Number(id);
        if (isNaN(idNum)) {
            return res.status(400).json({
                success: false,
                message: "El ID debe ser un número válido",
                data: null
            });
        }

        const eliminada = await EtiquetaService.eliminar(idNum);

        if (!eliminada) {
            return res.status(404).json({
                success: false,
                message: "Etiqueta no encontrada",
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: "Etiqueta eliminada correctamente",
            data: { id: idNum },
            error: null
        });

    } catch (error: any) {
        console.error("Error al eliminar etiqueta:", error);

        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
            data: null
        });
    }
};

export { crearEtiqueta, mostrarEtiquetas, buscarEtiqueta, eliminarEtiqueta }
