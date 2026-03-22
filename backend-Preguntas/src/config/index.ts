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
        host: process.env.PGHOST || "localhost",
        port: getNumber(process.env.PGPORT, 5432),
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || "admin",
        database: process.env.PGDATABASE || "bdpreguntas",
    },
};


export default config;
