# ============================================================
# JiraClone – Frontend Dockerfile (multi-stage)
# Stage 1 – Build  : node:18-alpine  → npm run build
# Stage 2 – Serve  : nginx:alpine    → serve /build
# ============================================================

# ── Stage 1: Build the React application ────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency manifests and install (cached layer)
# npm install (not npm ci) is used because the lock file may be out of sync
# with package.json after local edits. Run `npm install` locally then commit
# package-lock.json to switch back to the stricter `npm ci`.
COPY package*.json ./
RUN npm install && npm cache clean --force

# Copy source code
COPY . .

# REACT_APP_API_URL is baked in at build time; override via --build-arg
ARG REACT_APP_API_URL=http://localhost:8000
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Create the optimised production bundle
RUN npm run build

# ── Stage 2: Serve with Nginx ────────────────────────────────
FROM nginx:alpine AS production

# Remove default nginx config to avoid conflicts
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built React app from stage 1
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx listens on port 80
EXPOSE 80

# Default nginx CMD starts the server in the foreground
CMD ["nginx", "-g", "daemon off;"]
