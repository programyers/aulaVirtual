FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Ejecuta las migraciones antes de iniciar el servidor HTTP
CMD ["sh", "-c", "npm run migration:run && npm run start:dev"]