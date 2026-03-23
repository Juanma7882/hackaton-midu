import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../databaseconexion/index.js";

// Atributos reales en la tabla
interface EtiquetaAttributes {
    id: number;
    nombre: string;
    url: string;
}

// Atributos necesarios para crear (id opcional)
interface EtiquetaCreationAttributes extends Optional<EtiquetaAttributes, "id"> { }

class Etiqueta
    extends Model<EtiquetaAttributes, EtiquetaCreationAttributes>
    implements EtiquetaAttributes {

    id!: number;
    nombre!: string;
    url!: string;
}


//! el unicode de la tabla ayuda a que no se repitan los nombres pero es necesario hacerlo también en la base de datos
Etiqueta.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        nombre: { type: DataTypes.STRING, allowNull: false, unique: true },
        url: { type: DataTypes.STRING, allowNull: true },
    },
    {
        sequelize,
        tableName: "etiqueta",
        timestamps: false,
    }
);

export default Etiqueta;
