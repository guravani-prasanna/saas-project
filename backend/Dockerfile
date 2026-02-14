# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

# Install curl for healthcheck
RUN apk add --no-cache curl

# Entrypoint will run migrations + seeds then start server
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
