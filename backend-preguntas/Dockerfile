# syntax=docker/dockerfile:1.7
FROM node:20-slim AS build

WORKDIR /backend

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm sh -c 'if [ -f package-lock.json ]; then npm ci; else npm install; fi'
COPY . .
RUN npm run build
RUN mkdir -p dist/public && cp -R src/public/. dist/public/

FROM node:20-slim

WORKDIR /backend

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm sh -c 'if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi'
COPY --from=build /backend/dist ./dist
COPY --from=build /backend/src/database ./src/database
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

EXPOSE 3000

CMD ["npm", "run", "start"]
