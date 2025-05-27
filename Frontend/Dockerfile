# Etapa 1: Build
FROM node:18 AS builder

# Instala pnpm
RUN npm install -g pnpm

WORKDIR /app

COPY package*.json ./
RUN pnpm install

COPY . .
RUN pnpm build  # Compila la app Next.js

# Etapa 2: Producción
FROM node:18 AS runner

# Establece el directorio de trabajo
WORKDIR /app

# Instala pnpm
RUN npm install -g pnpm

# Solo copia lo necesario desde el builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["pnpm", "start"]
