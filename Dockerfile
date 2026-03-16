# ---------- FRONTEND BUILD ----------
  FROM node:22-slim AS frontend-build

  WORKDIR /frontend
  
  COPY frontend/package.json frontend/pnpm-lock.yaml* ./
  RUN corepack enable && pnpm install
  
  COPY frontend .
  RUN pnpm build
  
  
  # ---------- BACKEND BUILD ----------
  FROM node:22-bookworm-slim AS backend-build
  
  WORKDIR /backend
  
  COPY backend/package.json backend/package-lock.json* ./
  RUN npm install
  
  COPY backend .
  RUN npm run build
  
  
  # ---------- RUNTIME ----------
  FROM node:22-bookworm-slim
  
  WORKDIR /app
  
  # устанавливаем только runtime deps
  COPY backend/package.json ./
  RUN npm install --omit=dev
  
  # копируем backend build
  COPY --from=backend-build /backend/dist ./dist
  
  # копируем frontend build
  COPY --from=frontend-build /frontend/dist ./public
  
  # создаём volume
  RUN mkdir -p /data/images
  
  ENV NODE_ENV=production
  ENV PORT=8000
  ENV HOST=0.0.0.0
  ENV DATA_DIR=/data
  
  VOLUME ["/data"]
  
  EXPOSE 8000
  
  HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "require('http').get('http://localhost:8000/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
  
  CMD ["node", "dist/server.js"]