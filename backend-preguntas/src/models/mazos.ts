import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../databaseconexion/index.js";


interface MazosAttributes {
    id: number;
    nombre: string;
    descripcion: string;
    url: string;
}
interface MazosCreationAttributes extends Optional<MazosAttributes, "id"> { }

class Mazos
    extends Model<MazosAttributes, MazosCreationAttributes>
    implements MazosAttributes {
    id!: number;
    nombre!: string;
    descripcion!: string;
    url!: string;
}


Mazos.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: { type: DataTypes.TEXT, allowNull: false },
        descripcion: { type: DataTypes.TEXT, allowNull: false },
        url: { type: DataTypes.TEXT, allowNull: true },
    },
    {
        sequelize,
        tableName: "mazos",
        timestamps: false
    })
export default Mazos
