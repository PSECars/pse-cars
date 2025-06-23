# Build stage
FROM node:lts-alpine3.22 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./src ./src
COPY ./tsconfig.json ./

RUN npm run build

# Production stage
FROM node:lts-alpine3.22 AS production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm install --omit=dev --ignore-scripts

# Install ps for process checking
RUN apk add --no-cache procps

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 CMD ps aux | grep -v grep | grep "node dist/index.js" || exit 1

CMD ["node", "dist/index.js"]
