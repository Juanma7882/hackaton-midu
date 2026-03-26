FROM node:20-alpine
WORKDIR /backend
COPY package*.json ./
RUN npm install
COPY . .
RUN apk add --no-cache curl 
EXPOSE 3000
CMD ["npm", "run", "dev"]
# CMD ["npm", "run", "dev:seed"]