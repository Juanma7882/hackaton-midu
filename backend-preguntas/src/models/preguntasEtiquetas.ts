import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../databaseconexion/index.js";

import Preguntas from "./preguntas.js";
import Etiquetas from "./etiquetas.js";

interface  PreguntasEtiquetasAttributes {
    id: number;
    preguntaId: number;
    etiquetaId: number;
}

// id opcional al crear
interface PreguntasEtiquetasCreationAttributes
    extends Optional<PreguntasEtiquetasAttributes, "id"> { }

class PreguntasEtiquetas
    extends Model<PreguntasEtiquetasAttributes, PreguntasEtiquetasCreationAttributes>
    implements PreguntasEtiquetasAttributes {
     id!: number;
     preguntaId!: number;
     etiquetaId!: number;
}

PreguntasEtiquetas.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        preguntaId: { type: DataTypes.INTEGER, allowNull: false },
        etiquetaId: {type: DataTypes.INTEGER, allowNull: false}
    },
    {
        sequelize,
        tableName: "preguntas_etiquetas",
        timestamps: false
    }
);


// ASOCIACIONES MANY TO MANY
Preguntas.belongsToMany(Etiquetas, {
    through: PreguntasEtiquetas,
    foreignKey: "preguntaId",
    otherKey: "etiquetaId"
});

Etiquetas.belongsToMany(Preguntas, {
    through: PreguntasEtiquetas,
    foreignKey: "etiquetaId",
    otherKey: "preguntaId"
});
export default PreguntasEtiquetas;
