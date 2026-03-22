
import sequelize from "../databaseConexion/index.js";

import Etiquetas from "./etiquetas.js";
import Preguntas from "./preguntas.js";
import PreguntasEtiquetas from "./preguntasEtiquetas.js";

// // relaciones
// Preguntas.belongsToMany(Etiquetas, {
//   through: "preguntas_etiquetas",
//   as: "etiquetas",
//   foreignKey: "preguntaId"
// });

// Etiquetas.belongsToMany(Preguntas, {
//   through: "preguntas_etiquetas",
//   as: "preguntas",
//   foreignKey: "etiquetaId"
// });

// asociaciones
Preguntas.belongsToMany(Etiquetas, {
  through: PreguntasEtiquetas,
  foreignKey: "preguntaId",
});

Etiquetas.belongsToMany(Preguntas, {
  through: PreguntasEtiquetas,
  foreignKey: "etiquetaId",
});

export {
  sequelize,
  Etiquetas,
  Preguntas,
  PreguntasEtiquetas
};
