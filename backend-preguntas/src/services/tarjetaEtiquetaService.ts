import Etiqueta from "../models/etiquetas.js";
import { Etiquetas } from "../models/index.js";
import Preguntas from "../models/preguntas.js";
import { Op } from "sequelize";

type Dificultad = "Facil" | "Intermedio" | "Avanzado";
type DificultadesPorEtiqueta = Record<string, Dificultad>;

interface PreguntaConEtiquetas {
    id: number;
    pregunta: string;
    respuesta: string;
    dificultad: Dificultad;
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
                dificultad: preguntaPlana.dificultad,
                Etiqueta: etiquetas.map((etiqueta: { nombre: string }) => ({ nombre: etiqueta.nombre })),
            };
        });
    }

    private filtrarPorDificultad(
        preguntas: PreguntaConEtiquetas[],
        dificultadesPorEtiqueta?: DificultadesPorEtiqueta
    ) {
        if (!dificultadesPorEtiqueta || Object.keys(dificultadesPorEtiqueta).length === 0) {
            return preguntas;
        }

        return preguntas.filter((pregunta) => {
            const dificultadPregunta = pregunta.dificultad ?? "Intermedio";

            return pregunta.Etiqueta.some((etiqueta) => {
                const dificultadEsperada = dificultadesPorEtiqueta[etiqueta.nombre.trim().toLowerCase()];
                return !dificultadEsperada || dificultadEsperada === dificultadPregunta;
            });
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

            const etiqueta = await Etiqueta.findByPk(idEtiqueta);
            if (!etiqueta) {
                throw new Error(`etiqueta ${idEtiqueta} no existe`);
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
    async obtenerPreguntasPorEtiqueta(nombreEtiqueta: string, dificultad?: Dificultad) {
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

            return this.filtrarPorDificultad(
                this.serializarPreguntas(preguntas),
                dificultad ? { [etiquetaNormalizada]: dificultad } : undefined
            );
        } catch (error) {
            console.log("Error al listar tarjetas por etiqueta:", error);
            return [];
        }
    }

    async obtenerPreguntasPorEtiquetas(
        nombresEtiquetas: string[],
        dificultadesPorEtiqueta?: DificultadesPorEtiqueta
    ) {
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

            return this.filtrarPorDificultad(this.serializarPreguntas(preguntas), dificultadesPorEtiqueta);
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
