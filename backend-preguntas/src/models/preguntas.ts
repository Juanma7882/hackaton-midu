import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../databaseconexion/index.js";


interface PreguntasAttributes {
    id: number;
    pregunta: string;
    respuesta: string;
    dificultad: "Facil" | "Intermedio" | "Avanzado"
}
interface PreguntasCreationAttributes extends Optional<PreguntasAttributes, "id"> { }

class Preguntas
    extends Model<PreguntasAttributes, PreguntasCreationAttributes>
    implements PreguntasAttributes {
    id!: number;
    pregunta!: string;
    respuesta!: string;
    dificultad!: "Facil" | "Intermedio" | "Avanzado"
}


Preguntas.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        pregunta: { type: DataTypes.TEXT, allowNull: false },
        respuesta: { type: DataTypes.TEXT, allowNull: false },
        dificultad: { type: DataTypes.ENUM("Facil", "Intermedio", "Avanzado"), allowNull: true }
    },
    {
        sequelize,
        tableName: "preguntas",
        timestamps: false
    })

export default Preguntas
