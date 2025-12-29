# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build the app
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy built files and package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/vite.config.js ./

# Railway uses dynamic PORT
ENV PORT=3000

# Start preview server with Railway's PORT
CMD npm run preview -- --host 0.0.0.0 --port $PORT
