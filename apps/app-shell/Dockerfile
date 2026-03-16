# -----------------------------------------------------------------------------
# Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
# Clasificación: Estrictamente Confidencial.
# -----------------------------------------------------------------------------

# --- ESTADIO 1: CONSTRUCCIÓN (Frontend) ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de paquetes e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Construir la aplicación para producción (Vite produce carpeta /dist)
RUN npm run build

# --- ESTADIO 2: SERVIDOR (Nginx para Estáticos) ---
FROM nginx:stable-alpine AS runner

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos generados por Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto estándar HTTP
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
