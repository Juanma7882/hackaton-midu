# syntax=docker/dockerfile:1.7
FROM node:20-alpine

WORKDIR /frontend

# Copiar archivos de dependencias
COPY frontend-preguntas/package*.json ./

# Instalar dependencias con cache reutilizable
RUN --mount=type=cache,target=/root/.npm npm ci

# Copiar el resto del código
COPY frontend-preguntas/ .

EXPOSE 3003

CMD ["npm", "run", "dev"]
