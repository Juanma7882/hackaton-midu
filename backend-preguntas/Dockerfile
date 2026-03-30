# syntax=docker/dockerfile:1.7
FROM node:20-slim
WORKDIR /backend
COPY backend-preguntas/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY backend-preguntas/ .
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
EXPOSE 3000
CMD ["npm", "run", "dev"]
# CMD ["npm", "run", "dev:seed"]
