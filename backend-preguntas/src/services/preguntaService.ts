import Preguntas from "../models/preguntas.js";

// Tipo Inferido automáticamente del modelo
export type PreguntaModel = InstanceType<typeof Preguntas>;

class PreguntaService {

  // Listar todas las preguntas
  async listar() {
    try {
      const result = await Preguntas.findAll();
      return result;
    } catch (error) {
      console.error("Error al listar preguntas:", error);
    }
  }

  async buscarPreguntaPorId(idPregunta: number) {
    try {
      const result = await Preguntas.findByPk(idPregunta);
      return result;
    } catch (error) {
      console.error("Error al buscar pregunta:", error);
    }
  }

  async crear(pregunta: string, respuesta: string) {
    try {
      const nueva = await Preguntas.create({ pregunta, respuesta });
      return nueva;
    } catch (error) {
      console.error("Error al crear pregunta:", error);
    }
  }

  async editar(id: number, nuevaPregunta: string, nuevaRespuesta: string) {
    try {
      const card = await Preguntas.findByPk(id);
      if (!card) return null;

      card.pregunta = nuevaPregunta;
      card.respuesta = nuevaRespuesta;

      await card.save();
      return card;
    } catch (error) {
      console.error("Error al editar pregunta:", error);
    }
  }

  async eliminar(id: number) {
    try {
      const existe = await this.buscarPreguntaPorId(id);
      if (!existe) return null;

      const result = await Preguntas.destroy({ where: { id } });
      return result;
    } catch (error: any) {
      console.error("Error al eliminar pregunta:", error.message);
    }
  }
}

export default new PreguntaService();
