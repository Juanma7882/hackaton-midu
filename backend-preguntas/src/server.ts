import app from "./app.js";
import { seedDatabase } from "./database/seed.js";
import { conectarDB } from "./databaseconexion/index.js";
import { sequelize } from "./models/index.js";

const PORT = process.env.PORT ?? 3000;

async function normalizarDificultadPreguntasExistentes() {
  try {
    const descripcionTabla = await sequelize.getQueryInterface().describeTable("preguntas");

    if (!("dificultad" in descripcionTabla)) {
      return;
    }

    await sequelize.query(`
      UPDATE "preguntas"
      SET "dificultad" = 'Intermedio'
      WHERE "dificultad" IS NULL
         OR "dificultad" NOT IN ('Facil', 'Intermedio', 'Avanzado');
    `);

    console.log("Dificultades existentes normalizadas");
  } catch {
    // La tabla puede no existir todavia en una base nueva.
  }
}

async function startServer() {
  try {
    await conectarDB();
    await sequelize.authenticate();
    console.log("Conectado a la base de datos");

    await normalizarDificultadPreguntasExistentes();
    await sequelize.sync({ alter: true });
    console.log("📦 Tablas sincronizadas");

    if (process.env.SEED === 'true') {
      console.log("Iniciando el seeding de la base de datos...");
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor en http://localhost:${PORT} corriendo solo el backend`);
      console.log(`🚀 Servidor en http://localhost:3002   corriendo en docker`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor", error);
    process.exit(1);
  }
}

startServer();
