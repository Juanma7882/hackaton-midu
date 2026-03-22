FROM node:20-alpine

WORKDIR /frontend

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]