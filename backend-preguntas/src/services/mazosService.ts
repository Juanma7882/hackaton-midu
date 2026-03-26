import Mazos from "../models/mazos.js";

type NivelDificultad = "Facil" | "Intermedio" | "Avanzado";

class MazosService {
    // Listar todas las preguntas
    async listar() {
        try {
            const result = await Mazos.findAll();
            return result;
        } catch (error) {
            console.error("Error al listar preguntas:", error);
        }
    }

    async buscarMazosPorId(idPregunta: number) {
        try {
            const result = await Mazos.findByPk(idPregunta);
            return result;
        } catch (error) {
            console.error("Error al buscar pregunta:", error);
        }
    }

    async crear(nombre: string, descripcion: string, url: string) {
        try {
            const nueva = await Mazos.create({ nombre, descripcion, url });
            return nueva;
        } catch (error) {
            console.error("Error al crear mazo:", error);
        }
    }


    // async editar(id: number, nuevaPregunta: string, nuevaRespuesta: string) {
    //     try {
    //         const card = await Mazos.findByPk(id);
    //         if (!card) return null;

    //         card.pregunta = nuevaPregunta;
    //         card.respuesta = nuevaRespuesta;

    //         await card.save();
    //         return card;
    //     } catch (error) {
    //         console.error("Error al editar pregunta:", error);
    //     }
    // }

    async eliminar(id: number) {
        try {
            const existe = await this.buscarMazosPorId(id);
            if (!existe) return null;

            const result = await Mazos.destroy({ where: { id } });
            return result;
        } catch (error: any) {
            console.error("Error al eliminar pregunta:", error.message);
        }
    }



} export default MazosService