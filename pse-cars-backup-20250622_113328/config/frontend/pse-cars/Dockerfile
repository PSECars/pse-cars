FROM node:22-alpine AS base
# RUN apk add --no-cache g++ make py3-pip libc6-compat
WORKDIR /app
COPY package*.json ./

FROM base AS builder

# Set ARG for build-time environment variables
ARG NEXT_PUBLIC_MAPBOX_TOKEN
ARG NEXT_PUBLIC_WORLD_DRIVE_HOST

# Set ENV from ARG to make them available during build
ENV NEXT_PUBLIC_MAPBOX_TOKEN=${NEXT_PUBLIC_MAPBOX_TOKEN}
ENV NEXT_PUBLIC_WORLD_DRIVE_HOST=${NEXT_PUBLIC_WORLD_DRIVE_HOST}

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build


FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs


COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD npm start
