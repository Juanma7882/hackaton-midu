import tarjetaEtiquetaService from '../services/tarjetaEtiquetaService.js'

type Dificultad = "Facil" | "Intermedio" | "Avanzado";

function parsearDificultades(raw: unknown): Record<string, Dificultad> | undefined {
    if (typeof raw !== "string" || raw.trim().length === 0) {
        return undefined;
    }

    try {
        const parsed = JSON.parse(raw) as Record<string, Dificultad>;
        return Object.fromEntries(
            Object.entries(parsed).map(([etiqueta, dificultad]) => [etiqueta.trim().toLowerCase(), dificultad])
        );
    } catch (error) {
        console.error("No se pudieron parsear las dificultades", error);
        return undefined;
    }
}

export const asignarEtiquetaATarjeta = async (req: any, res: any) => {
    try {
        const { idEtiqueta, idPregunta } = req.body;
        const resultado = await tarjetaEtiquetaService.agregarEtiquetaATarjeta(idEtiqueta, idPregunta);
        return res.status(200).json({
            success: true,
            message: "Etiqueta asignada a la tarjeta correctamente",
            data: resultado,
            error: null
        });
    } catch (error: any) {
        console.error("Error al asignar etiqueta a la tarjeta:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
            data: null
        });
    }
};



export const listarTarjetasPorEtiquetaPorNombre = async (req: any, res: any) => {
    try {
        const etiquetasQuery = typeof req.query.etiquetas === "string" ? req.query.etiquetas : "";
        const dificultades = parsearDificultades(req.query.dificultades);

        if (etiquetasQuery.trim().length > 0) {
            const tarjetas = await tarjetaEtiquetaService.obtenerPreguntasPorEtiquetas(
                etiquetasQuery.split(","),
                dificultades
            );

            return res.status(200).json({
                success: true,
                message: "Tarjetas obtenidas correctamente para las etiquetas indicadas",
                count: tarjetas.length,
                data: tarjetas,
                error: null
            });
        }

        const tarjetas = await tarjetaEtiquetaService.obtenerEtiquetasConPreguntas();
        return res.status(200).json({
            success: true,
            message: "Tarjetas agrupadas por etiqueta obtenidas correctamente",
            count: tarjetas.length,
            data: tarjetas,
            error: null
        });
    } catch (error: any) {
        console.error("Error al listar tarjetas por etiqueta:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
            data: null
        });
    }
};



/**
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export const traerPreguntasPorNombreEtiqueta = async (req: any, res: any) => {
    try {
        const { nombreEtiqueta } = req.params;
        const dificultades = parsearDificultades(req.query.dificultades);
        const dificultad = dificultades?.[String(nombreEtiqueta).trim().toLowerCase()];
        const tarjetas = await tarjetaEtiquetaService.obtenerPreguntasPorEtiqueta(nombreEtiqueta, dificultad);
        return res.status(200).json({
            success: true,
            message: `Tarjetas con la etiqueta "${nombreEtiqueta}" obtenidas correctamente`,
            count: tarjetas.length,
            data: tarjetas,
            error: null
        });
    } catch (error: any) {
        console.error("Error al listar tarjetas por etiqueta:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
            data: null
        });
    }
};
