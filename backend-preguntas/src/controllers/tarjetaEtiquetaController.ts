import tarjetaEtiquetaService from '../services/tarjetaEtiquetaService.js'

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
        const { nombreEtiqueta } = req.params;
        const tarjetas = await tarjetaEtiquetaService.obtenerEtiquetasConPreguntas();
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



/**
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export const traerPreguntasPorNombreEtiqueta = async (req: any, res: any) => {
    try {
        const { nombreEtiqueta } = req.params;
        const tarjetas = await tarjetaEtiquetaService.obtenerPreguntasPorEtiqueta(nombreEtiqueta);
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
