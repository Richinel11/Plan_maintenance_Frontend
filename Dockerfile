# ============================================================
# ENEOPLAN Frontend — Dockerfile Multi-Stage
# Stage 1 : Build (Node.js)
# Stage 2 : Serve  (Nginx Alpine)
# ============================================================

# ── STAGE 1 : Build ────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Supprimer node_modules et package-lock.json avant de reconstruire
RUN rm -rf node_modules package-lock.json

# Copie des fichiers de dépendances en premier (cache Docker optimisé)
COPY package.json package-lock.json ./

# Installation des dépendances
RUN npm ci

# Copie du reste du code source
COPY . .

# Build de production Vite
# La variable VITE_API_BASE_URL peut être injectée au build
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build


# ── STAGE 2 : Serve ────────────────────────────────────────
FROM nginx:stable-alpine AS production

# Suppression de la config Nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copie de notre config Nginx personnalisée (gestion SPA React)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers buildés depuis le stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposition du port HTTP
EXPOSE 80

# Démarrage de Nginx en mode foreground (requis pour Docker)
CMD ["nginx", "-g", "daemon off;"]
