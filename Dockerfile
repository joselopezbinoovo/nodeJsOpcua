# Usa una imagen oficial de Node.js
FROM node:17.0.0-alpine 


# Crea y establece el directorio de trabajo
WORKDIR /home/node/nodejsopcua
# Copia el archivo package.json y package-lock.json (si existen)
COPY package*.json ./

RUN apk add openssl 

# Instala las dependencias
RUN npm install
# Usa una imagen base de Ubuntu

# Copia el resto de la aplicación
COPY . .

# Expone el puerto 3000
EXPOSE 8082 

# Comando para iniciar la aplicación
CMD ["npm", "start"]
