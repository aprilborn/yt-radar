# ---------- FRONTEND BUILD ----------
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

RUN corepack enable

COPY frontend/package.json frontend/pnpm-lock.yaml* ./

RUN pnpm i

COPY frontend .

RUN pnpm build


# ---------- BACKEND BUILD ----------
FROM node:22-alpine AS backend-build

WORKDIR /app/backend

RUN corepack enable

COPY backend/package.json backend/pnpm-lock.yaml* ./

RUN pnpm i

COPY backend .

RUN npm run build


# ---------- RUNTIME ----------
FROM node:22-alpine

WORKDIR /app

RUN corepack enable

# создаём пользователя (TrueNAS это любит)
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# backend deps
COPY backend/package.json backend/pnpm-lock.yaml* ./

RUN npm install

# backend build
COPY --from=backend-build /app/backend/dist ./dist

# frontend build → public
COPY --from=frontend-build /app/frontend/dist ./public

# runtime folders
RUN mkdir -p /data/images && chown -R nodejs:nodejs /data

ENV PORT=8000
ENV HOST=0.0.0.0
ENV WEB_ROOT=/app/public

VOLUME ["/data"]

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
CMD node -e "require('http').get('http://localhost:8000/public/status',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/server.js"]

LABEL org.opencontainers.image.title="YT Radar"
LABEL org.opencontainers.image.description="YouTube RSS watcher that automatically sends requests to MeTube"
LABEL org.opencontainers.image.source="https://github.com/aprilborn/yt-radar"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.authors="Denis T"
