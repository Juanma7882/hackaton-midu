FROM node:20-alpine

WORKDIR /frontend

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

EXPOSE 3003

CMD ["npm", "run", "dev"]
