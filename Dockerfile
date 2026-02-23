# Build Stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy shared package
COPY circlesfera-shared ./circlesfera-shared

# Copy frontend package files
COPY circlesfera-frontend/package*.json ./circlesfera-frontend/

WORKDIR /app/circlesfera-frontend

# Install dependencies
RUN npm ci

# Copy frontend source code
COPY circlesfera-frontend .

# Build the application
RUN npm run build

# Production Stage
FROM nginx:alpine AS production

# Copy the built application from the build stage to Nginx html directory
COPY --from=build /app/circlesfera-frontend/dist /usr/share/nginx/html

# Copy custom nginx config
COPY circlesfera-frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
