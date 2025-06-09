# Build stage
FROM node:lts-alpine3.22 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN npm run build

# Production stage
FROM node:lts-alpine3.22 AS production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm install --omit=dev --ignore-scripts

EXPOSE 3001

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]
