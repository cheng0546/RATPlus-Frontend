# Build the Angular application in a disposable Node image.
FROM node:22-alpine AS build

WORKDIR /app

# Copy dependency manifests first so this layer is cached until dependencies change.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build -- --configuration production

# Serve only the compiled static files in production.
FROM nginx:1.27-alpine AS runtime

# Render supplies PORT (10000 by default).  Restrict the official image's
# template substitution to it so Nginx variables such as $uri stay intact.
ENV PORT=10000 \
    NGINX_ENVSUBST_FILTER=PORT

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Angular's application builder emits dist/<project>/browser. Finding index.html
# keeps this independent of the Angular workspace's exact project-name casing.
COPY --from=build /app/dist /tmp/dist
RUN set -eux; \
    app_dir="$(dirname "$(find /tmp/dist -type f -name index.html -print -quit)")"; \
    test -n "$app_dir"; \
    cp -a "$app_dir"/. /usr/share/nginx/html/; \
    rm -rf /tmp/dist

EXPOSE 10000

CMD ["nginx", "-g", "daemon off;"]
