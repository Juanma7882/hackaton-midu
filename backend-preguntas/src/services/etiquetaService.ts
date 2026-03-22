import Etiquetas from "../models/etiquetas.js";

// Tipo Inferido automáticamente del modelo
export type EtiquetaModel = InstanceType<typeof Etiquetas>;

class EtiquetaService {

    async crear(nombreEtiqueta: string, etiquetaUrl: string): Promise<EtiquetaModel> {
        const nombreEtiquetaNormalizado = nombreEtiqueta.trim().toLowerCase();

        try {
            const etiquetaExistente = await Etiquetas.findOne({ where: { nombre: nombreEtiquetaNormalizado } });
            if (etiquetaExistente) {
                return etiquetaExistente;
            }

            const etiqueta = await Etiquetas.create({
                nombre: nombreEtiquetaNormalizado,
                url: etiquetaUrl
            });

            return etiqueta;

        } catch (error) {
            console.error("Error al crear etiqueta:", error);
        }
    }

    /** Lista todas las etiquetas (id, nombre, url) */
    async listar(): Promise<EtiquetaModel[]> {
        try {
            return await Etiquetas.findAll({
                attributes: ["id", "nombre", "url"],
            });
        } catch (error) {
            console.error("Error al listar etiquetas:", error);
        }
    }

    /** Busca por nombre */
    async buscarEtiquetaPorNombre(nombreEtiqueta: string): Promise<EtiquetaModel | null> {
        const nombreEtiquetaNormalizado = nombreEtiqueta.trim().toLowerCase();

        try {
            return await Etiquetas.findOne({ where: { nombre: nombreEtiquetaNormalizado } });
        } catch (error) {
            console.error("Error al buscar etiqueta:", error);
        }
    }

    /** Busca por ID */
    async buscarEtiquetaPorId(idEtiqueta: number): Promise<EtiquetaModel | null> {
        try {
            return await Etiquetas.findOne({ where: { id: idEtiqueta } });
        } catch (error) {
            console.error("Error al buscar etiqueta:", error);
        }
    }

    /** Elimina una etiqueta por ID */
    async eliminar(id: number): Promise<number | null> {
        try {
            const existe = await this.buscarEtiquetaPorId(id);
            if (!existe) return null;

            return await Etiquetas.destroy({ where: { id } });

        } catch (error) {
            console.error("Error al eliminar etiqueta:", error);
        }
    }

    /** Verifica si existe una etiqueta por nombre */
    async etiquetaExiste(nombreEtiqueta: string): Promise<boolean> {
        const nombreEtiquetaNormalizado = nombreEtiqueta.trim().toLowerCase();
        try {
            const etiqueta = await this.buscarEtiquetaPorNombre(nombreEtiquetaNormalizado);
            return etiqueta !== null;
        } catch (error) {
            console.error("Error al verificar existencia:", error);
        }
    }
}

export default new EtiquetaService();
