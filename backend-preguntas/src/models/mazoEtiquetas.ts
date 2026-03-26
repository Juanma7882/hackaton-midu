import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../databaseconexion/index.js";


interface MazoEtiquetasAttributes {
    id: number;
    mazoId: number;
    etiquetaId: number;
    opcional: boolean;
}

// id opcional al crear
interface MazoEtiquetasCreationAttributes
    extends Optional<MazoEtiquetasAttributes, "id"> { }

class MazoEtiquetas
    extends Model<MazoEtiquetasAttributes, MazoEtiquetasCreationAttributes>
    implements MazoEtiquetasAttributes {
    id!: number;
    mazoId!: number;
    etiquetaId!: number;
    opcional!: boolean;
}

MazoEtiquetas.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        mazoId: { type: DataTypes.INTEGER, allowNull: false },
        etiquetaId: { type: DataTypes.INTEGER, allowNull: false },
        opcional: { type: DataTypes.BOOLEAN, allowNull: true },
    },
    {
        sequelize,
        tableName: "Mazo_etiquetas",
        timestamps: false
    }
);

export default MazoEtiquetas;
