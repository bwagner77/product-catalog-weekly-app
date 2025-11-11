# Frontend Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps || npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
# Install curl for container healthchecks
RUN apk add --no-cache curl
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
