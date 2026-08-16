FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration=production

FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/*

COPY deployment/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/jwt-ui/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx"]
