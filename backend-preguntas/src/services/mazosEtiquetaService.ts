import Preguntas from "../models/preguntas.js";
import Etiqueta from "../models/etiquetas.js";
import MazoEtiquetas from "../models/mazoEtiquetas.js";
import Mazos from "../models/mazos.js";
import { Op } from "sequelize";
import { Etiquetas } from "../models/index.js";


interface MazoConRelaciones extends Mazos {
    etiquetas?: any[];
}

type Dificultad = "Facil" | "Intermedio" | "Avanzado"


class MazosEtiquetaService {

    async agregarEtiquetaAlMazo(idEtiqueta: number, idMazo: number, opcional: boolean) {
        try {

            const mazo = await Mazos.findByPk(idMazo);

            if (!mazo) {
                throw new Error(`mazo ${idMazo} no existe`);
            }

            const etiqueta = await Etiqueta.findByPk(idEtiqueta);
            if (!etiqueta) {
                throw new Error(`etiqueta ${idEtiqueta} no existe`);
            }

            const mazoEtiquetas = await MazoEtiquetas.create({
                etiquetaId: idEtiqueta,
                mazoId: idMazo,
                opcional: opcional
            });
            return {
                mensaje: "Etiqueta agregada correctamente",
                etiquetaId: mazoEtiquetas.etiquetaId,
                mazoId: mazoEtiquetas.mazoId,
                opcional: mazoEtiquetas.opcional

            };
        } catch (error) {
            console.error("Error al agregar etiqueta:", error);
            throw error;
        }
    }

    async obtenerMazosConSusEtiquetas() {
        try {
            const { count, rows } = await Mazos.findAndCountAll({
                attributes: ["id", "nombre", "descripcion", "url"],
                include: [{
                    model: Etiquetas,
                    as: "etiquetas", // 🔥 CLAVE
                    attributes: ["id", "nombre"],
                    through: {
                        attributes: ["id", "opcional"] // 👈 de la tabla intermedia
                    }
                }]
            });

            return {
                total: count,
                mazos: rows
            };

        } catch (error) {
            console.error("Error al obtener el mazo con sus etiqueta:", error);
            throw error;
        }
    }


    async obtenerMazoConSusEtiquetasYPreguntas(id: number, limitePreguntas: number = 10, dificultad: Dificultad, etiquetasSeleccionadas?: number[]) {
        try {
            // 1. Obtener mazo
            console.log("id", id)
            console.log("limitePreguntas", limitePreguntas)
            console.log("dificultad", dificultad)
            console.log("etiquetasSeleccionadas", etiquetasSeleccionadas)

            const mazoBase = await Mazos.findByPk(id);

            if (!mazoBase) {
                throw new Error("Mazo no encontrado");
            }

            // 2. Obtener mazo con relaciones
            const mazo = await Mazos.findOne({
                where: { id },
                attributes: ["id", "nombre", "descripcion", "url"],
                include: [
                    {
                        model: Etiqueta,
                        as: "etiquetas",
                        attributes: ["id", "nombre"],
                        through: { attributes: [] },
                        ...(etiquetasSeleccionadas?.length && {
                            where: { id: { [Op.in]: etiquetasSeleccionadas } }
                        }),
                        include: [
                            {
                                model: Preguntas,
                                attributes: ["id", "pregunta", "respuesta", "dificultad"],
                                where: {
                                    dificultad: dificultad
                                },
                                through: { attributes: [] },
                                required: false, // evita que rompa si no hay preguntas
                                include: [{
                                    model: Etiqueta,
                                    attributes: ["nombre"],
                                    through: { attributes: [] },
                                    required: false,
                                }]
                            }
                        ]
                    }
                ]
            });

            const mazoTyped = mazo as MazoConRelaciones;
            // 3. Flatten + random + limit
            let preguntas: any[] = [];

            mazoTyped.etiquetas?.forEach((etiqueta: any) => {
                if (etiqueta.Preguntas?.length) {
                    preguntas.push(...etiqueta.Preguntas);
                }
            });

            // 🔀 mezclar aleatoriamente
            preguntas = preguntas.sort(() => Math.random() - 0.5);

            // ✂️ limitar cantidad
            preguntas = preguntas.slice(0, limitePreguntas);

            return {
                preguntas
            };

        } catch (error) {
            console.error("Error al obtener el mazo:", error);
            throw error;
        }
    }

}

export default MazosEtiquetaService