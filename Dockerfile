# Frontend image for the Adhere web client (adhere-web).
# Vite build (API URL baked in at build time) -> static files served by `serve`.
# syntax=docker/dockerfile:1

FROM node:22-slim AS build
WORKDIR /app

# Install deps. --force bypasses EBADPLATFORM: package.json lists both
# @biomejs/cli-linux-x64 and @biomejs/cli-darwin-arm64 as (non-optional) devDeps,
# so a strict install hard-fails on whichever platform binary doesn't match the
# build host. --force installs the matching one and skips the other.
COPY package.json package-lock.json ./
RUN npm install --force --no-audit --no-fund

COPY . .

# VITE_* vars must be present at build time (baked into the static bundle).
ARG VITE_API_URL
ARG VITE_DEMO_MODE=false
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_DEMO_MODE=$VITE_DEMO_MODE
RUN npm run build

# --- runtime: static file server with the project's security headers ---
FROM node:22-slim AS run
WORKDIR /app
RUN npm i -g serve@14
COPY --from=build /app/dist ./dist
COPY --from=build /app/serve.json ./serve.json

EXPOSE 3000
# -c serve.json -> applies CSP/security headers + "public": "dist"
# -s             -> SPA fallback to index.html for client-side routes
CMD ["sh", "-c", "exec serve -c serve.json -s -l tcp://0.0.0.0:${PORT:-3000}"]
