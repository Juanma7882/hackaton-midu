import fs from "fs/promises";
import path from "path";
import sequelize from "../databaseconexion/index.js";

import Etiquetas from "../models/etiquetas.js";
import MazoEtiquetas from "../models/mazoEtiquetas.js";
import Mazos from "../models/mazos.js";
import Preguntas from "../models/preguntas.js";
import PreguntasEtiquetas from "../models/preguntasEtiquetas.js";

const dataPath = path.resolve("src/database/");
const preguntasDataPath = path.join(dataPath, "data", "preguntas");

type Dificultad = "Facil" | "Intermedio" | "Avanzado";

interface EtiquetaSeed {
  nombre: string;
  url: string;
}

interface PreguntaSeed {
  pregunta: string;
  respuesta: string;
  dificultad?: unknown;
  etiquetas?: string[];
}

interface DatasetPreguntas {
  etiqueta?: EtiquetaSeed;
  preguntas?: PreguntaSeed[];
}

interface MazoSeed {
  nombre: string;
  descripcion: string;
  url?: string;
  requeridas: string[];
  opcional?: string[];
}

interface ArchivoMazos {
  mazos: MazoSeed[];
}

function normalizarNombre(valor: string) {
  return valor.trim().toLowerCase();
}

function normalizarDificultad(dificultad: unknown): Dificultad {
  if (dificultad === "Facil" || dificultad === "Intermedio" || dificultad === "Avanzado") {
    return dificultad;
  }

  return "Intermedio";
}

async function jsonData<T>(nombreArchivo: string): Promise<T | null> {
  try {
    const data = await fs.readFile(path.join(dataPath, nombreArchivo), "utf-8");
    return JSON.parse(data) as T;
  } catch (error) {
    console.error("Error al leer el archivo JSON:", error);
    return null;
  }
}

async function cargarArchivosPreguntas() {
  try {
    const archivos = (await fs.readdir(preguntasDataPath))
      .filter((archivo) => archivo.endsWith(".json"))
      .sort();

    const datasets = await Promise.all(
      archivos.map(async (archivo) => {
        const data = await fs.readFile(path.join(preguntasDataPath, archivo), "utf-8");
        return JSON.parse(data) as DatasetPreguntas;
      })
    );

    const etiquetas = datasets
      .map((dataset) => dataset.etiqueta)
      .filter((etiqueta): etiqueta is EtiquetaSeed => Boolean(etiqueta?.nombre));

    const preguntas = datasets.flatMap((dataset) => dataset.preguntas ?? []);

    return { etiquetas, preguntas, totalArchivos: archivos.length };
  } catch (error) {
    console.error("Error al leer los archivos de preguntas:", error);
    return null;
  }
}

async function sincronizarEtiquetas(etiquetasSeed: EtiquetaSeed[]) {
  const etiquetasExistentes = await Etiquetas.findAll();
  const etiquetasPorNombre = new Map<string, InstanceType<typeof Etiquetas>>();

  for (const etiqueta of etiquetasExistentes) {
    const nombre = normalizarNombre(String(etiqueta.get("nombre") ?? ""));
    if (nombre) {
      etiquetasPorNombre.set(nombre, etiqueta);
    }
  }

  let creadas = 0;
  let actualizadas = 0;

  for (const etiquetaSeed of etiquetasSeed) {
    const nombre = normalizarNombre(etiquetaSeed.nombre);
    if (!nombre) continue;

    const existente = etiquetasPorNombre.get(nombre);

    if (existente) {
      const urlActual = String(existente.get("url") ?? "");
      const urlNueva = etiquetaSeed.url ?? "";

      if (urlActual !== urlNueva) {
        await existente.update({ url: urlNueva });
        actualizadas += 1;
      }

      continue;
    }

    const creada = await Etiquetas.create({ nombre, url: etiquetaSeed.url ?? "" });
    etiquetasPorNombre.set(nombre, creada);
    creadas += 1;
  }

  return { etiquetasPorNombre, creadas, actualizadas };
}

async function sincronizarPreguntas(preguntasSeed: PreguntaSeed[]) {
  const preguntasExistentes = await Preguntas.findAll();
  const preguntasPorTexto = new Map<string, InstanceType<typeof Preguntas>>();

  for (const pregunta of preguntasExistentes) {
    const texto = String(pregunta.get("pregunta") ?? "").trim();
    if (texto) {
      preguntasPorTexto.set(texto, pregunta);
    }
  }

  let creadas = 0;

  for (const preguntaSeed of preguntasSeed) {
    const texto = String(preguntaSeed.pregunta ?? "").trim();
    if (!texto || preguntasPorTexto.has(texto)) continue;

    const creada = await Preguntas.create({
      pregunta: texto,
      respuesta: String(preguntaSeed.respuesta ?? ""),
      dificultad: normalizarDificultad(preguntaSeed.dificultad),
    });

    preguntasPorTexto.set(texto, creada);
    creadas += 1;
  }

  return {
    preguntasPorTexto,
    creadas,
    existentesAntes: preguntasExistentes.length,
  };
}

async function sincronizarRelacionesPreguntaEtiqueta(
  preguntasSeed: PreguntaSeed[],
  preguntasPorTexto: Map<string, InstanceType<typeof Preguntas>>,
  etiquetasPorNombre: Map<string, InstanceType<typeof Etiquetas>>
) {
  const relacionesExistentes = await PreguntasEtiquetas.findAll();
  const relaciones = new Set<string>();

  for (const relacion of relacionesExistentes) {
    relaciones.add(`${relacion.get("preguntaId")}:${relacion.get("etiquetaId")}`);
  }

  const nuevasRelaciones: Array<{ preguntaId: number; etiquetaId: number }> = [];
  let creadas = 0;
  let omitidas = 0;

  for (const preguntaSeed of preguntasSeed) {
    const texto = String(preguntaSeed.pregunta ?? "").trim();
    const pregunta = preguntasPorTexto.get(texto);

    if (!pregunta) {
      omitidas += 1;
      continue;
    }

    const preguntaId = Number(pregunta.get("id"));
    const nombresEtiquetas = Array.isArray(preguntaSeed.etiquetas) ? preguntaSeed.etiquetas : [];

    for (const nombreEtiqueta of nombresEtiquetas) {
      const etiqueta = etiquetasPorNombre.get(normalizarNombre(nombreEtiqueta));

      if (!etiqueta) {
        omitidas += 1;
        continue;
      }

      const etiquetaId = Number(etiqueta.get("id"));
      const clave = `${preguntaId}:${etiquetaId}`;

      if (relaciones.has(clave)) {
        continue;
      }

      relaciones.add(clave);
      nuevasRelaciones.push({ preguntaId, etiquetaId });
      creadas += 1;
    }
  }

  if (nuevasRelaciones.length > 0) {
    await PreguntasEtiquetas.bulkCreate(nuevasRelaciones);
  }

  return { creadas, omitidas };
}

async function sincronizarMazos(mazosSeed: MazoSeed[]) {
  const mazosExistentes = await Mazos.findAll();
  const mazosPorNombre = new Map<string, InstanceType<typeof Mazos>>();

  for (const mazo of mazosExistentes) {
    const nombre = normalizarNombre(String(mazo.get("nombre") ?? ""));
    if (nombre) {
      mazosPorNombre.set(nombre, mazo);
    }
  }

  let creados = 0;
  let actualizados = 0;

  for (const mazoSeed of mazosSeed) {
    const nombreNormalizado = normalizarNombre(mazoSeed.nombre);
    if (!nombreNormalizado) continue;

    const mazoExistente = mazosPorNombre.get(nombreNormalizado);

    if (mazoExistente) {
      const descripcionActual = String(mazoExistente.get("descripcion") ?? "");
      const urlActual = String(mazoExistente.get("url") ?? "");
      const descripcionNueva = mazoSeed.descripcion ?? "";
      const urlNueva = mazoSeed.url ?? "";

      if (descripcionActual !== descripcionNueva || urlActual !== urlNueva) {
        await mazoExistente.update({
          descripcion: descripcionNueva,
          url: urlNueva,
        });
        actualizados += 1;
      }

      continue;
    }

    const mazoCreado = await Mazos.create({
      nombre: mazoSeed.nombre,
      descripcion: mazoSeed.descripcion,
      url: mazoSeed.url ?? "",
    });

    mazosPorNombre.set(nombreNormalizado, mazoCreado);
    creados += 1;
  }

  return { mazosPorNombre, creados, actualizados };
}

function combinarOpcional(actual: unknown, siguiente: unknown) {
  if (actual === false || siguiente === false) {
    return false;
  }

  if (actual === true || siguiente === true) {
    return true;
  }

  return null;
}

async function deduplicarMazosExistentes() {
  return sequelize.transaction(async (transaction) => {
    const mazosExistentes = await Mazos.findAll({
      order: [["id", "ASC"]],
      transaction,
    });

    const grupos = new Map<string, InstanceType<typeof Mazos>[]>();

    for (const mazo of mazosExistentes) {
      const nombre = normalizarNombre(String(mazo.get("nombre") ?? ""));
      if (!nombre) continue;

      const grupo = grupos.get(nombre) ?? [];
      grupo.push(mazo);
      grupos.set(nombre, grupo);
    }

    let mazosEliminados = 0;
    let relacionesMovidas = 0;
    let relacionesEliminadas = 0;

    for (const grupo of grupos.values()) {
      if (grupo.length <= 1) continue;

      const [mazoCanonico, ...duplicados] = grupo;
      const mazoCanonicoId = Number(mazoCanonico.get("id"));

      for (const mazoDuplicado of duplicados) {
        const mazoDuplicadoId = Number(mazoDuplicado.get("id"));
        const relaciones = await MazoEtiquetas.findAll({
          where: { mazoId: mazoDuplicadoId },
          order: [["id", "ASC"]],
          transaction,
        });

        for (const relacion of relaciones) {
          const etiquetaId = Number(relacion.get("etiquetaId"));
          const relacionCanonica = await MazoEtiquetas.findOne({
            where: {
              mazoId: mazoCanonicoId,
              etiquetaId,
            },
            transaction,
          });

          if (relacionCanonica) {
            const opcionalCombinado = combinarOpcional(
              relacionCanonica.get("opcional"),
              relacion.get("opcional")
            );

            if (relacionCanonica.get("opcional") !== opcionalCombinado) {
              await relacionCanonica.update({ opcional: opcionalCombinado }, { transaction });
            }

            await relacion.destroy({ transaction });
            relacionesEliminadas += 1;
            continue;
          }

          await relacion.update({ mazoId: mazoCanonicoId }, { transaction });
          relacionesMovidas += 1;
        }

        await mazoDuplicado.destroy({ transaction });
        mazosEliminados += 1;
      }
    }

    return { mazosEliminados, relacionesMovidas, relacionesEliminadas };
  });
}

async function asegurarIndiceUnicoMazos() {
  await sequelize.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS mazos_nombre_normalizado_uidx
    ON mazos ((lower(btrim(nombre))));
  `);
}

async function sincronizarRelacionesMazoEtiqueta(
  mazosSeed: MazoSeed[],
  mazosPorNombre: Map<string, InstanceType<typeof Mazos>>,
  etiquetasPorNombre: Map<string, InstanceType<typeof Etiquetas>>
) {
  const relacionesExistentes = await MazoEtiquetas.findAll();
  const relacionesPorClave = new Map<string, InstanceType<typeof MazoEtiquetas>>();
  const clavesExistentes = new Set<string>();

  for (const relacion of relacionesExistentes) {
    const clave = `${relacion.get("mazoId")}:${relacion.get("etiquetaId")}`;
    relacionesPorClave.set(clave, relacion);
    clavesExistentes.add(clave);
  }

  const nuevasRelaciones: Array<{ mazoId: number; etiquetaId: number; opcional: boolean }> = [];
  let creadas = 0;
  let actualizadas = 0;
  let omitidas = 0;

  for (const mazoSeed of mazosSeed) {
    const mazo = mazosPorNombre.get(normalizarNombre(mazoSeed.nombre));

    if (!mazo) {
      omitidas += 1;
      continue;
    }

    const mazoId = Number(mazo.get("id"));
    const etiquetasMazo = [
      ...(mazoSeed.requeridas ?? []).map((nombre) => ({ nombre, opcional: false })),
      ...(mazoSeed.opcional ?? []).map((nombre) => ({ nombre, opcional: true })),
    ];

    for (const etiquetaMazo of etiquetasMazo) {
      const etiqueta = etiquetasPorNombre.get(normalizarNombre(etiquetaMazo.nombre));

      if (!etiqueta) {
        omitidas += 1;
        continue;
      }

      const etiquetaId = Number(etiqueta.get("id"));
      const clave = `${mazoId}:${etiquetaId}`;

      if (clavesExistentes.has(clave) && !relacionesPorClave.has(clave)) {
        continue;
      }

      const relacionExistente = relacionesPorClave.get(clave);

      if (!relacionExistente) {
        clavesExistentes.add(clave);
        nuevasRelaciones.push({ mazoId, etiquetaId, opcional: etiquetaMazo.opcional });
        creadas += 1;
        continue;
      }

      const opcionalActual = Boolean(relacionExistente.get("opcional"));
      if (opcionalActual !== etiquetaMazo.opcional) {
        await relacionExistente.update({ opcional: etiquetaMazo.opcional });
        actualizadas += 1;
      }
    }
  }

  if (nuevasRelaciones.length > 0) {
    await MazoEtiquetas.bulkCreate(nuevasRelaciones);
  }

  return { creadas, actualizadas, omitidas };
}

export async function seedDatabase() {
  console.log("🌱 Iniciando seed...");

  const archivoPreguntas = await cargarArchivosPreguntas();
  const archivoMazo = await jsonData<ArchivoMazos>("mazos.json");

  if (!archivoPreguntas || !archivoMazo) {
    console.error("Error leyendo archivos JSON:", {
      archivoPreguntas: Boolean(archivoPreguntas),
      archivoMazo: Boolean(archivoMazo),
    });
    return;
  }

  const preguntasEnBase = await Preguntas.count();
  if (preguntasEnBase > 0) {
    console.log(`🌱 Se detectaron ${preguntasEnBase} preguntas existentes. Se completara el seed faltante.`);
  }

  const etiquetasSeed = archivoPreguntas.etiquetas;
  const preguntasSeed = archivoPreguntas.preguntas;
  const mazosSeed = Array.isArray(archivoMazo.mazos) ? archivoMazo.mazos : [];

  const etiquetasResultado = await sincronizarEtiquetas(etiquetasSeed);
  const preguntasResultado = await sincronizarPreguntas(preguntasSeed);
  const relacionesPreguntaEtiquetaResultado = await sincronizarRelacionesPreguntaEtiqueta(
    preguntasSeed,
    preguntasResultado.preguntasPorTexto,
    etiquetasResultado.etiquetasPorNombre
  );
  const deduplicacionMazosResultado = await deduplicarMazosExistentes();
  await asegurarIndiceUnicoMazos();
  const mazosResultado = await sincronizarMazos(mazosSeed);
  const relacionesMazoEtiquetaResultado = await sincronizarRelacionesMazoEtiqueta(
    mazosSeed,
    mazosResultado.mazosPorNombre,
    etiquetasResultado.etiquetasPorNombre
  );

  const totalPreguntas = await Preguntas.count();

  console.log(`Archivos de preguntas procesados: ${archivoPreguntas.totalArchivos}`);
  console.log(`Preguntas existentes antes del seed: ${preguntasResultado.existentesAntes}`);
  console.log(`Etiquetas creadas: ${etiquetasResultado.creadas}`);
  console.log(`Etiquetas actualizadas: ${etiquetasResultado.actualizadas}`);
  console.log(`Preguntas creadas: ${preguntasResultado.creadas}`);
  console.log(`Relaciones pregunta-etiqueta creadas: ${relacionesPreguntaEtiquetaResultado.creadas}`);
  console.log(`Mazos duplicados eliminados: ${deduplicacionMazosResultado.mazosEliminados}`);
  console.log(`Relaciones mazo-etiqueta movidas: ${deduplicacionMazosResultado.relacionesMovidas}`);
  console.log(`Relaciones mazo-etiqueta duplicadas eliminadas: ${deduplicacionMazosResultado.relacionesEliminadas}`);
  console.log(`Mazos creados: ${mazosResultado.creados}`);
  console.log(`Mazos actualizados: ${mazosResultado.actualizados}`);
  console.log(`Relaciones mazo-etiqueta creadas: ${relacionesMazoEtiquetaResultado.creadas}`);
  console.log(`Relaciones mazo-etiqueta actualizadas: ${relacionesMazoEtiquetaResultado.actualizadas}`);
  console.log(`Preguntas totales en la base: ${totalPreguntas}`);
  console.log("🌱 Seed aplicado correctamente");
}
