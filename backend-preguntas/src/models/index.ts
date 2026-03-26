
import sequelize from "../databaseconexion/index.js";

import Etiquetas from "./etiquetas.js";
import MazoEtiquetas from "./mazoEtiquetas.js";
import Mazos from "./mazos.js";
import Preguntas from "./preguntas.js";
import PreguntasEtiquetas from "./preguntasEtiquetas.js";



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



// belongsToMany con alias únicos
Mazos.belongsToMany(Etiquetas, {
  through: MazoEtiquetas,
  foreignKey: "mazoId",
  as: "etiquetas"
})

Etiquetas.belongsToMany(Mazos, {
  through: MazoEtiquetas,
  foreignKey: "etiquetaId",
  as: "mazos"
})
// Para acceder a MazoEtiquetas directo (lo que tenés)
MazoEtiquetas.belongsTo(Mazos, { foreignKey: "mazoId" })
Mazos.hasMany(MazoEtiquetas, { foreignKey: "mazoId" })

MazoEtiquetas.belongsTo(Etiquetas, { foreignKey: "etiquetaId" })
Etiquetas.hasMany(MazoEtiquetas, { foreignKey: "etiquetaId" })



export {
  sequelize,
  Etiquetas,
  Preguntas,
  PreguntasEtiquetas,
  Mazos,
  MazoEtiquetas
};
