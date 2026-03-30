import fs from "fs/promises";
import path from "path";

import PreguntaService from "../services/preguntaService.js";
import tarjetaEtiquetaService from "../services/tarjetaEtiquetaService.js";
import etiquetaService from "../services/etiquetaService.js";
import MazosService from "../services/mazosService.js";
import MazosEtiquetaService from "../services/mazosEtiquetaService.js";
const dataPath = path.resolve("src/database/");

async function jsonData(nombreArchivo: string) {
  try {

    const data = await fs.readFile(path.join(dataPath, nombreArchivo), "utf-8");
    return JSON.parse(data);

  } catch (error) {
    console.error("Error al leer el archivo JSON:", error);
  }
}

function normalizarDificultad(dificultad: unknown) {
  if (dificultad === "Facil" || dificultad === "Intermedio" || dificultad === "Avanzado") {
    return dificultad;
  }

  return "Intermedio";
}

export async function seedDatabase() {
  console.log("🌱 Iniciando seed...");

  const preguntasExistentes = await PreguntaService.listar();
  if ((preguntasExistentes?.length ?? 0) > 0) {
    console.log(`🌱 Seed omitido: ya existen ${preguntasExistentes?.length ?? 0} preguntas en la base de datos.`);
    return;
  }

  // ========= datos ========================================================================

  const archivoReact = await jsonData("archivodereact.json");
  const archivoTypescrip = await jsonData("archivotypescrip.json");
  const archivoSql = await jsonData("basededatosrelacionales.json");
  const archivoJs = await jsonData("js.json");
  const archivoNode = await jsonData("node.json");
  const archivoMazo = await jsonData("mazos.json");

  // Validar que todos los archivos se leyeron correctamente
  if (!archivoReact || !archivoTypescrip || !archivoSql || !archivoJs || !archivoNode || !archivoMazo) { // Se agregó archivoMazo a la validación
    console.error("Error leyendo archivos JSON:", {
      archivoReact: !!archivoReact,
      archivoTypescrip: !!archivoTypescrip,
      archivoSql: !!archivoSql,
      archivoJs: !!archivoJs,
      archivoNode: !!archivoNode,
      archivoMazo: !!archivoMazo // Se agregó archivoMazo al log
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
      console.log(etiqueta)
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

  const existingPreguntas = new Set(
    (await PreguntaService.listar() ?? []).map((p: any) =>
      typeof p?.get === "function" ? p.get("pregunta") : p?.pregunta
    ).filter(Boolean)
  );

  try {
    for (const pregunta of todasPreguntas) {
      if (existingPreguntas.has(pregunta.pregunta)) {
        console.log(`Pregunta ya existe: ${pregunta.pregunta}`);
        continue;
      }
      const preguntaCreada = await PreguntaService.crear(
        pregunta.pregunta,
        pregunta.respuesta,
        normalizarDificultad(pregunta.dificultad)
      );
      if (!preguntaCreada) {
        console.warn(`No se pudo crear la pregunta: ${pregunta.pregunta}`);
        continue;
      }
      preguntasCreadas.push({ // Se mejoró el acceso al ID de la pregunta creada
        ...pregunta,
        id: (preguntaCreada as any).id || preguntaCreada.dataValues?.id
      });
      existingPreguntas.add(pregunta.pregunta);
    }
    console.log(`Preguntas creadas: ${preguntasCreadas.length} 😎`);
  }
  catch (error) {
    console.error("Error al insertar preguntas:", error);
  }

  // ========= RELACIONES ========================================================================

  try {
    for (const pregunta of preguntasCreadas) {
      if (!pregunta.id) {
        console.warn("Pregunta sin ID, se salta relación");
        continue;
      }

      if (!Array.isArray(pregunta.etiquetas) || pregunta.etiquetas.length === 0) {
        console.warn("Pregunta sin etiquetas, se omite relación");
        continue;
      }

      for (const nombreEtiqueta of pregunta.etiquetas) {
        const etiquetaEncontrada = await etiquetaService.buscarEtiquetaPorNombre(nombreEtiqueta);
        if (!etiquetaEncontrada) {
          console.warn(`Etiqueta no encontrada para una relación de seed: ${nombreEtiqueta}`);
          continue;
        }

        const etiquetaEncontradaId = etiquetaEncontrada.dataValues.id;
        await tarjetaEtiquetaService.agregarEtiquetaATarjeta(
          etiquetaEncontradaId,
          pregunta.id
        );
      }
    }
  } catch (error) {
    console.error("Error en relaciones:", error)
  }


  const mazosService = new MazosService()
  const mazosEtiquetaService = new MazosEtiquetaService()


  for (const mazo of archivoMazo.mazos) {
    const crearMazo = await mazosService.crear(mazo.nombre, mazo.descripcion, mazo.url)
    if (!crearMazo) { // Se agregó validación para mazo no creado
      console.warn(`No se pudo crear el mazo: ${mazo.nombre}`);
      continue;
    }
    for (const nombreEtiqueta of mazo.requeridas) {
      const etiqueta = await etiquetaService.buscarEtiquetaPorNombre(nombreEtiqueta)
      if (!etiqueta) {
        console.warn(`⚠️  Etiqueta no encontrada: "${nombreEtiqueta}" — se omite`)
        continue
      }
      await mazosEtiquetaService.agregarEtiquetaAlMazo(etiqueta.dataValues.id, crearMazo.dataValues.id, true)
    }

    for (const nombreEtiqueta of mazo.opcional ?? []) {
      const etiqueta = await etiquetaService.buscarEtiquetaPorNombre(nombreEtiqueta)

      if (!etiqueta) {
        console.warn(`⚠️  Etiqueta no encontrada: "${nombreEtiqueta}" — se omite`)
        continue
      }

      await mazosEtiquetaService.agregarEtiquetaAlMazo(etiqueta.dataValues.id, crearMazo.dataValues.id, false)
    }
  }

  console.log("🌱 Seed aplicado correctamente");
}
