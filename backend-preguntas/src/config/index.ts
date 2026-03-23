import { resolve } from "path";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: resolve(process.cwd(), ".env") });

const getNumber = (value: string | undefined, fallback: number): number => {
    const n = parseInt(value ?? "", 10);
    return Number.isNaN(n) ? fallback : n;
};

interface DBConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

export interface AppConfig {
    port: number;
    env: string;
    db: DBConfig;
}

const config: AppConfig = {
    port: getNumber(process.env.PORT, 3000),
    env: process.env.NODE_ENV || "development",
    db: {
        host: process.env.PGHOST || process.env.PG_HOST || "localhost",
        port: getNumber(process.env.PGPORT ?? process.env.PG_PORT, 5432),
        user: process.env.PGUSER || process.env.PG_USER || "postgres",
        password: process.env.PGPASSWORD || process.env.PG_PASSWORD || "admin",
        database: process.env.PGDATABASE || process.env.PG_DATABASE || "bdpreguntas",
    },
};


export default config;
