# --- ESTADIO 1: CONSTRUCCIÓN ---
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Instalar dependencias necesarias para Prisma y compilación (openssl es crítico)
RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copiar archivos de definición de paquetes
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# --- ESTADIO 2: EJECUCIÓN (Runtime) ---
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# Variables de entorno por defecto
ENV NODE_ENV=production

# Instalar openssl para Prisma en el runtime
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de producción + herramientas para SEED (opcional)
COPY package*.json ./
RUN npm install --omit=dev

# Copiar artefactos
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/prisma ./prisma

EXPOSE 3002
CMD ["node", "dist/main.js"]
