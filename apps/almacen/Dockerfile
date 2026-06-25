# --- ESTADIO 1: CONSTRUCCIÓN ---
FROM node:20-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

# --- ESTADIO 2: EJECUCIÓN (Runtime) ---
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/prisma ./prisma

EXPOSE 3012
CMD ["node", "dist/main.js"]
