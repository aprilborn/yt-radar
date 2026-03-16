# ---------- FRONTEND BUILD ----------
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

RUN corepack enable

COPY frontend/package.json frontend/pnpm-lock.yaml* ./

RUN pnpm install

COPY frontend .

RUN pnpm build


# ---------- BACKEND BUILD ----------
FROM node:22-alpine AS backend-build

WORKDIR /app/backend

RUN corepack enable

COPY backend/package.json backend/pnpm-lock.yaml* ./

RUN pnpm install

COPY backend .

RUN pnpm build


# ---------- RUNTIME ----------
FROM node:22-alpine

WORKDIR /app

RUN corepack enable

# создаём пользователя (TrueNAS это любит)
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# backend deps
COPY backend/package.json backend/pnpm-lock.yaml* ./

RUN pnpm install --prod

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

USER nodejs

HEALTHCHECK --interval=30s --timeout=3s \
CMD wget -qO- http://localhost:8000/api/health || exit 1

CMD ["node", "dist/server.js"]