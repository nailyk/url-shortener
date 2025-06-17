FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy root-level files for server and shared-types
COPY ./shared-types ./shared-types
COPY ./server ./server

# Install shared-types dependencies and build
WORKDIR /app/shared-types
RUN npm install && npm run build

# Install server dependencies (uses file:../shared-types)
WORKDIR /app/server
RUN npm install

# Build server
RUN npm run build

# Set final working directory and expose port
EXPOSE 3000
CMD ["npm", "run", "start"]
