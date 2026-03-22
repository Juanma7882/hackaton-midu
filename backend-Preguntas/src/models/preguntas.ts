import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../databaseConexion/index.js";


interface PreguntasAttributes {
    id: number;
    pregunta: string;
    respuesta: string;
}
interface PreguntasCreationAttributes extends Optional<PreguntasAttributes, "id"> { }

class Preguntas
    extends Model<PreguntasAttributes, PreguntasCreationAttributes>
    implements PreguntasAttributes {
    id!: number;
    pregunta!: string;
    respuesta!: string;
}


Preguntas.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        pregunta: { type: DataTypes.TEXT, allowNull: false },
        respuesta: { type: DataTypes.TEXT, allowNull: false }
    },
    {
        sequelize,
        tableName: "preguntas",
        timestamps: false
    })
export default Preguntas