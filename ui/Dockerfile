FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY .env ./
COPY src ./src
COPY public ./public
COPY index.html vite.config.ts tsconfig*.json ./

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]