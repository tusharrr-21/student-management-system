# Student Management System — Node.js on Alpine
# Build for one service at a time (frontend or backend) via build-arg SERVICE.
# docker compose sets SERVICE and EXPOSE_PORT for each service.

FROM node:20-alpine

ARG SERVICE=frontend
ARG EXPOSE_PORT=3000

WORKDIR /app

# Dependency manifests (cache-friendly layer)
COPY ${SERVICE}/package.json ${SERVICE}/package-lock.json ./
RUN npm ci --omit=dev

# Full application source for that service
COPY ${SERVICE}/ ./

ENV NODE_ENV=production

EXPOSE ${EXPOSE_PORT}

CMD ["npm", "start"]
