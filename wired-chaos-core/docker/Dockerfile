FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --production=false

COPY tsconfig.json ./
COPY src/ ./src/

RUN npx tsc

# ── Production stage ──────────────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db/migrations ./dist/db/migrations

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]
