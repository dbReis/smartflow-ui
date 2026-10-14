# SmartFlow UI image: the built static site, served by nginx, which also
# forwards /api to the SmartFlow API. The browser only talks to this
# container's origin, so the API needs no CORS, and the API address is set
# when the container starts (API_URL), not when the image is built.
#
#   docker build -t ddosreis/smartflow-ui .
#   docker run -p 8080:80 -e API_URL=http://host.docker.internal:8888 ddosreis/smartflow-ui

# --- Build: Node version from .nvmrc ---------------------------------------
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Served at the root, not /smartflow-ui/ (GitHub Pages).
ENV BASE_PATH=/
# "/" makes the app call /api on its own origin; nginx forwards it to API_URL.
ENV VITE_API_URL=/
RUN npm run build

# --- Serve -----------------------------------------------------------------
FROM nginx:1.29-alpine
# The official image runs envsubst on /etc/nginx/templates/*.template at start.
ENV API_URL=http://app:8888
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
