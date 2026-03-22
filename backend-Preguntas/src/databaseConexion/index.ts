import { Sequelize } from "sequelize";
import config from "../config/index.js";

const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: "postgres",
    logging: false,// activar logs de consultas osea mostrar en consola las consultas SQL que se ejecutan
  }
);

export async function conectarDB() {
  let intentos = 0;
  while (true) {
    try {
      await sequelize.authenticate();
      console.log("✅ DB conectada");
      break;
    } catch (error) {
      intentos++;
      console.log(`⏳ Esperando DB... intento ${intentos}`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}


export default sequelize;