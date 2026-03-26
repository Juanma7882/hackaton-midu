import MazosEtiquetaService from "../services/mazosEtiquetaService.js"
export type Dificultad = "Facil" | "Intermedio" | "Avanzado"
import { Request, Response } from "express";

export interface MazoSchema {
    id: number
    limitePreguntas?: number
    dificultad: Dificultad
    etiquetasSeleccionadas?: number[]
}

export const obtenerMazosConSusEtiquetas = async (req: Request, res: Response) => {
    try {
        const mazoEtiquetaService = new MazosEtiquetaService()
        const obtenerMazoConSusEtiquetas = await mazoEtiquetaService.obtenerMazosConSusEtiquetas()
        // console.log(obtenerMazoConSusEtiquetas)
        return res.status(200).json(obtenerMazoConSusEtiquetas)
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener el mazo" })
    }
}


// export const obtenerMazoEspecificoConSusPreguntasYEtiquetas = async (req: Request, res: Response) => {
//     try {
//         const { id, limitePreguntas, dificultad, etiquetasSeleccionadas } = req.body as MazoSchema

//         const mazoEtiquetaService = new MazosEtiquetaService()
//         const mazo = await mazoEtiquetaService.obtenerMazoConSusEtiquetasYPreguntas(
//             id,
//             limitePreguntas,
//             dificultad,
//             etiquetasSeleccionadas
//         )

//         return res.status(200).json(mazo)
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({ message: "Error al obtener el mazo" })
//     }
// }

export const obtenerMazoEspecificoConSusPreguntasYEtiquetas = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { limitePreguntas, dificultad, etiquetasSeleccionadas } = req.query;

        const mazoEtiquetaService = new MazosEtiquetaService();

        const mazo = await mazoEtiquetaService.obtenerMazoConSusEtiquetasYPreguntas(
            Number(id),
            limitePreguntas ? Number(limitePreguntas) : undefined,
            dificultad as Dificultad,
            etiquetasSeleccionadas
                ? (Array.isArray(etiquetasSeleccionadas)
                    ? etiquetasSeleccionadas.map(Number)
                    : [Number(etiquetasSeleccionadas)])
                : undefined
        );

        return res.status(200).json(mazo);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al obtener el mazo" });
    }
};