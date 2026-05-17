# ============================================================
# JiraClone – Backend Dockerfile
# Base: node:18-alpine (small, production-grade LTS image)
# ============================================================

FROM node:18-alpine

# Install dumb-init so Node.js is not PID 1 (proper signal handling / graceful shutdown)
RUN apk add --no-cache dumb-init

# Create app directory and set ownership to non-root user
WORKDIR /app

# Copy dependency manifests first (layer-cache optimisation)
COPY package*.json ./

# Install ALL deps (nodemon is in dependencies, not devDependencies)
RUN npm ci --omit=dev && npm cache clean --force

# Copy the rest of the source code
COPY . .

# Create and switch to a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# The app reads PORT from env; default is 8000 (matches app.js)
EXPOSE 8000

# Use dumb-init as PID 1 to correctly forward OS signals to Node
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "app.js"]
