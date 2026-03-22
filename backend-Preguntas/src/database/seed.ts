import fs from "fs/promises";
import path from "path";

import PreguntaService from "../services/preguntaService.js";
import tarjetaEtiquetaService from "../services/tarjetaEtiquetaService.js";
import etiquetaService from "../services/etiquetaService.js";

const dataPath = path.resolve("src/database/");


async function jsonData(nombreArchivo: string) {
  try {

    const data = await fs.readFile(path.join(dataPath, nombreArchivo), "utf-8");
    return JSON.parse(data);

  } catch (error) {
    console.error("Error al leer el archivo JSON:", error);
  }
}



export async function seedDatabase() {
  console.log("🌱 Iniciando seed...");

  // ========= datos ========================================================================

  const archivoReact = await jsonData("archivoDeReact.json");
  const archivoTypescrip = await jsonData("archivoTypeScrip.json");
  const archivoSql = await jsonData("baseDeDatosRelacionales.json");
  const archivoJs = await jsonData("js.json");
  const archivoNode = await jsonData("node.json");

  // Validar que todos los archivos se leyeron correctamente
  if (!archivoReact || !archivoTypescrip || !archivoSql || !archivoJs || !archivoNode) {
    console.error("Error leyendo archivos JSON:", {
      archivoReact: !!archivoReact,
      archivoTypescrip: !!archivoTypescrip,
      archivoSql: !!archivoSql,
      archivoJs: !!archivoJs,
      archivoNode: !!archivoNode,
    });
    return;
  }

  // ========= ETIQUETAS ========================================================================

  const todasEtiquetas = [
    ...archivoJs.etiquetas,
    ...archivoNode.etiquetas,
    ...archivoReact.etiquetas,
    ...archivoSql.etiquetas,
    ...archivoTypescrip.etiquetas,
  ];

  try {
    for (const etiqueta of todasEtiquetas) {
      // usar la propiedad 'url' del JSON (minúscula)
      await etiquetaService.crear(etiqueta.nombre, etiqueta.url);
    }
    console.log("etiquetas procesadas (creadas o existentes) correctamente");
  }
  catch (error) {
    console.error("Error al insertar etiquetas:", error);
  }

  // ========= PREGUNTAS ========================================================================

  const preguntasCreadas = [];

  const todasPreguntas = [
    ...archivoJs.preguntas,
    ...archivoNode.preguntas,
    ...archivoReact.preguntas,
    ...archivoSql.preguntas,
    ...archivoTypescrip.preguntas,
  ];

  try {
    for (const pregunta of todasPreguntas) {
      const preguntaCreada = await PreguntaService.crear(pregunta.pregunta, pregunta.respuesta);
      preguntasCreadas.push({
        ...pregunta,
        id: preguntaCreada.dataValues.id
      })
    }
    console.log(`Preguntas creadas: ${preguntasCreadas.length}`);
  }
  catch (error) {
    console.error("Error al insertar preguntas:", error);
  }

  // ========= RELACIONES ========================================================================

  try {
    for (const pregunta of preguntasCreadas) {
      if (!pregunta.id) {
        console.log("Pregunta sin ID, se salta:", pregunta.pregunta);
        continue;
      }

      if (!Array.isArray(pregunta.etiquetas) || pregunta.etiquetas.length === 0) {
        console.log("Pregunta sin etiquetas:", pregunta.id, pregunta.pregunta);
        continue;
      }

      for (const nombreEtiqueta of pregunta.etiquetas) {
        const etiquetaEncontrada = await etiquetaService.buscarEtiquetaPorNombre(nombreEtiqueta);
        if (!etiquetaEncontrada) {
          console.log(`Etiqueta no encontrada: ${nombreEtiqueta} (para pregunta ${pregunta.id})`);
          continue;
        }

        const etiquetaEncontradaId = etiquetaEncontrada.dataValues.id;
        const rsp = await tarjetaEtiquetaService.agregarEtiquetaATarjeta(
          etiquetaEncontradaId,
          pregunta.id
        );
        console.log("Etiqueta relacionada:", nombreEtiqueta, "->", pregunta.id, rsp)
      }
    }
  } catch (error) {
    console.log("Error en relaciones:", error)
  }


  console.log("🌱 Seed aplicado correctamente");
}
