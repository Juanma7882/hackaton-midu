# Setup y ejecución del proyecto localmente

## Comandos principales

| Comando | Descripción |
|---------|-------------|
| `npm run docker:up` | Ejecuta frontend, backend y base de datos localmente con Docker Compose. |
| `npm run docker:down` | Detiene y elimina los contenedores. |
| `npm run dev:frontend` | Ejecuta solo el frontend en modo desarrollo (Vite). Requiere tener la DB y el backend corriendo. |
| `npm run dev:backend` | Ejecuta solo el backend en modo desarrollo (ts-node/express). Requiere tener la DB corriendo. |
| `npm run build:frontend` | Compila el frontend para producción (TypeScript + Vite build). |
| `npm run build:backend` | Compila el backend a JavaScript (TypeScript → `dist/`). |
| `npm run lint:frontend` | Ejecuta ESLint en el frontend para revisar el código. |
Este cambio mejorara el workflow al tener la inicializacion del proyecto centralizada en el root folder.


✅ Nivel 1 — Normalización en la BASE DE DATOS (obligatorio)
🔹 1. nombre debe ser UNIQUE

En PostgreSQL:

ALTER TABLE etiqueta
ADD CONSTRAINT etiqueta_nombre_unique UNIQUE (nombre);

📌 Esto garantiza:

Nunca más dos filas con el mismo nombre

Aunque se te escape un bug en el backend

🔹 2. Evitar mayúsculas/minúsculas (MUY importante)

Postgres diferencia:

JavaScript ≠ javascript

✔️ Solución profesional: índice UNIQUE sobre LOWER(nombre)
CREATE UNIQUE INDEX etiqueta_nombre_unique_lower
ON etiqueta (LOWER(nombre));

🔒 Resultado:

"JavaScript" y "javascript" → ❌ duplicado

"TypeScript" → ✔️ permitido