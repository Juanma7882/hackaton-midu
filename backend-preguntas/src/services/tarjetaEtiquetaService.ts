import Etiquetas from "../models/etiquetas.js";
import Preguntas from "../models/preguntas.js";
import { Op } from "sequelize";

interface PreguntaConEtiquetas {
    id: number;
    pregunta: string;
    respuesta: string;
    Etiqueta: Array<{ nombre: string }>;
}

class TarjetaEtiquetaService {
    private serializarPreguntas(preguntas: any[]): PreguntaConEtiquetas[] {
        return preguntas.map((pregunta) => {
            const preguntaPlana = typeof pregunta.get === "function" ? pregunta.get({ plain: true }) : pregunta;
            const etiquetas = preguntaPlana.Etiquetas ?? preguntaPlana.Etiqueta ?? [];

            return {
                id: preguntaPlana.id,
                pregunta: preguntaPlana.pregunta,
                respuesta: preguntaPlana.respuesta,
                Etiqueta: etiquetas.map((etiqueta: { nombre: string }) => ({ nombre: etiqueta.nombre })),
            };
        });
    }

    /**
     *  Asocia una etiqueta existente a una pregunta existente/tarjeta específica
     *  estableciendo una relación many-to-many entre ambos registros
     * @param idEtiqueta  Identificador único de la etiqueta a asociar
     * @param idPregunta  Identificador único de la pregunta/tarjeta a etiquetar
     * @returns Objeto con mensaje de confirmación e IDs involucrados
     * @throws {Error} Si la etiqueta o la pregunta no existen en la base de datos
     * @throws {Error} Si ocurre un error durante la operación de base de datos
     * @example // Asocia la etiqueta con ID 3 a la pregunta con ID 15 
     * const resultado = await agregarEtiquetaATarjeta(3, 15);
     * Retorna: { mensaje: "Etiqueta agregada correctamente", etiquetaId: 3, preguntaId: 15 }
     */
    async agregarEtiquetaATarjeta(idEtiqueta: number, idPregunta: number) {
        try {
            const pregunta = await Preguntas.findByPk(idPregunta);
            if (!pregunta) {
                throw new Error(`Pregunta ${idPregunta} no existe`);
            }

            await (pregunta as any).addEtiqueta(idEtiqueta);
            return {
                mensaje: "Etiqueta agregada correctamente",
                etiquetaId: idEtiqueta,
                preguntaId: idPregunta,
            };
        } catch (error) {
            console.error("Error al agregar etiqueta:", error);
            throw error;
        }
    }


    /**
     * 
     * Recupera todas las preguntas/tarjetas asociadas a una etiqueta específica
     * 
     * identificada por su nombre, incluyendo todas sus etiquetas relacionadas.
     * 
     * @param nombreEtiqueta - Nombre exacto de la etiqueta para filtrar las preguntas
     * 
     * @returns Array de preguntas/tarjetas que contienen la etiqueta especificada,
     * 
     * text
     *      cada una con sus etiquetas asociadas incluidas en la respuesta
     * @throws {Error} Si ocurre un error durante la consulta a la base de datos
     *
     * @example //Busca todas las tarjetas etiquetadas con "JavaScript"
     *  const tarjetas = await listarPorEtiqueta("JavaScript");
     *   Retorna: [
     *   { id: 1, titulo: "Closures en JS", etiquetas: [{nombre: "JavaScript"}, {nombre: "Avanzado"}] },
     *   { id: 3, titulo: "Promesas", etiquetas: [{nombre: "JavaScript"}, {nombre: "Async"}] }]
    * @returns Array de preguntas/tarjetas que contienen la etiqueta especificada,<text> 
    * cada una con sus etiquetas asociadas incluidas en la respuesta
    * @throws {Error} Si ocurre un error durante la consulta a la base de datos
    * @example // Busca todas las tarjetas etiquetadas con "JavaScript"
    * const tarjetas = await listarPorEtiqueta("JavaScript");
    *  Retorna: [{ id: 1, titulo: "Closures en JS", etiquetas: [{nombre: "JavaScript"}, {nombre: "Avanzado"}] },
    * 
    * { id: 3, titulo: "Promesas", etiquetas: [{nombre: "JavaScript"}, {nombre: "Async"}] }    
    * ]
    */
    async obtenerPreguntasPorEtiqueta(nombreEtiqueta: string) {
        try {
            const etiquetaNormalizada = nombreEtiqueta.trim().toLowerCase();
            const preguntas = await Preguntas.findAll({
                include: [
                    {
                        model: Etiquetas,
                        where: { nombre: etiquetaNormalizada },
                        attributes: ["nombre"],
                        through: { attributes: [] },
                    },
                ],
            });

            return this.serializarPreguntas(preguntas);
        } catch (error) {
            console.log("Error al listar tarjetas por etiqueta:", error);
            return [];
        }
    }

    async obtenerPreguntasPorEtiquetas(nombresEtiquetas: string[]) {
        try {
            const etiquetasNormalizadas = nombresEtiquetas
                .map((etiqueta) => etiqueta.trim().toLowerCase())
                .filter(Boolean);

            if (etiquetasNormalizadas.length === 0) {
                return [];
            }

            const preguntas = await Preguntas.findAll({
                include: [
                    {
                        model: Etiquetas,
                        where: {
                            nombre: {
                                [Op.in]: etiquetasNormalizadas,
                            },
                        },
                        attributes: ["nombre"],
                        through: { attributes: [] },
                    },
                ],
                order: [["id", "ASC"]],
            });

            return this.serializarPreguntas(preguntas);
        } catch (error) {
            console.log("Error al listar tarjetas por multiples etiquetas:", error);
            return [];
        }
    }

    async obtenerEtiquetasConPreguntas() {
        try {
            const etiquetas = await Etiquetas.findAll({
                attributes: ["id", "nombre"],
                include: [
                    {
                        model: Preguntas,
                        attributes: ["id", "pregunta", "respuesta"],
                        through: { attributes: [] },
                    }
                ]
            });

            return etiquetas;
        } catch (error) {
            console.log("Error al obtener etiquetas con preguntas:", error);
            throw error;
        }
    }

}

export default new TarjetaEtiquetaService();
