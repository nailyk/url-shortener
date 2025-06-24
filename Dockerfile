# Stage 1: Base builder
FROM node:22-alpine AS base
WORKDIR /app

# Only copy package.json and lockfile first to leverage Docker caching
COPY package*.json ./

# Copy workspace package.json files to resolve all workspace dependencies
COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY playwright/package*.json ./playwright/
COPY shared-types/package*.json ./shared-types/

# Install all dependencies using workspaces
RUN npm install

# Copy the rest of the monorepo
COPY . .

# Stage 2: Build client
FROM base AS client-build
WORKDIR /app/client
RUN npm run build

# Stage 3: Build server
FROM base AS server-build
WORKDIR /app/server
RUN npm run build

# Stage 4: Server runtime image
FROM node:22-alpine AS server
WORKDIR /app
COPY --from=server-build /app /app
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "server"]

# Stage 5: Client runtime image
FROM nginx:alpine AS client
COPY --from=client-build /app/client/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
