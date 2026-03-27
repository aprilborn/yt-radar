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
  FROM node:22-alpine
  
  WORKDIR /app
  

  COPY backend/package*.json ./
  RUN npm install --omit=dev
  
  COPY --from=backend-build /backend/dist ./dist
  COPY --from=frontend-build /frontend/dist ./public
  
  RUN mkdir -p /data/images
  
  ENV NODE_ENV=production
  ENV PORT=8000
  ENV HOST=0.0.0.0
  ENV DATA_DIR=/data
  
  VOLUME ["/data"]
  
  EXPOSE 8000
  
  HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
  
  CMD ["node", "dist/server.js"]

  LABEL org.opencontainers.image.source="https://github.com/aprilborn/yt-radar"
  LABEL org.opencontainers.image.version="1.0.0"
  LABEL org.opencontainers.image.title="YT Radar"
  LABEL org.opencontainers.image.description="YouTube RSS watcher that sends downloads to MeTube"
  LABEL org.opencontainers.image.documentation="https://github.com/aprilborn/yt-radar/blob/main/README.md"