# Dockerfile (Frontend/Dockerfile)
FROM node:18

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

COPY package*.json ./
RUN pnpm install  # Usar pnpm en lugar de npm

COPY . .

EXPOSE 3000

# Usa el comando 'dev' en lugar de 'build' y 'start' para desarrollo
CMD ["npm", "run", "dev"]
