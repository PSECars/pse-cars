FROM node:18-alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --production

COPY --from=builder /usr/src/app/dist ./dist
# COPY --from=builder /usr/src/app/.env ./.env

# Create a non-root user to run the application
RUN addgroup -S appuser && adduser -S -G appuser appuser
USER appuser

# Expose the application port
EXPOSE ${PORT:-3002}

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3002}/health || exit 1

CMD ["node", "dist/main"]
