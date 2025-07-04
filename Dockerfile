FROM node:22-alpine AS base
WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY playwright/package*.json ./playwright/
COPY shared-types/package*.json ./shared-types/

RUN npm install

COPY . .

FROM base AS client-build
WORKDIR /app/client
RUN npm run build

FROM base AS server-build
WORKDIR /app/server
RUN npm run build

FROM node:22-alpine AS server
WORKDIR /app
COPY --from=server-build /app /app
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "server"]

FROM nginx:alpine AS client
COPY --from=client-build /app/client/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
