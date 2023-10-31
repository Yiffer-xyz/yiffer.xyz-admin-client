FROM node:14.17.3-alpine as build
RUN apk add --no-cache python3 py3-pip make g++
WORKDIR /app
COPY package.json /app/package.json
RUN npm install
COPY . /app
RUN npm run build

FROM joshix/caddy:v0.11.3
COPY --from=build /app/dist /var/www/html
COPY Caddyfile /etc/caddy/Caddyfile
CMD ["-conf", "/etc/caddy/Caddyfile"]
