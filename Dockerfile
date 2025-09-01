# Multi-stage Docker build for Gatsby portfolio with theme system
# Stage 1: Build frontend application
FROM node:18-alpine AS frontend-builder

# Set working directory
WORKDIR /app

# Install dependencies for better caching
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Build arguments for different environments
ARG NODE_ENV=production
ARG GATSBY_THEME_API_URL
ARG GATSBY_GA_TRACKING_ID
ARG GATSBY_SENTRY_DSN
ARG GATSBY_ANALYTICS_ENABLED

# Set environment variables
ENV NODE_ENV=$NODE_ENV
ENV GATSBY_THEME_API_URL=$GATSBY_THEME_API_URL
ENV GATSBY_GA_TRACKING_ID=$GATSBY_GA_TRACKING_ID
ENV GATSBY_SENTRY_DSN=$GATSBY_SENTRY_DSN
ENV GATSBY_ANALYTICS_ENABLED=$GATSBY_ANALYTICS_ENABLED

# Build the application
RUN yarn build

# Stage 2: Backend API server
FROM node:18-alpine AS backend-builder

WORKDIR /backend

# Copy backend dependencies (assuming we'll create these)
COPY api/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY api/ ./

# Stage 3: Production frontend server
FROM nginx:alpine AS frontend-production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Copy built application from frontend-builder stage
COPY --from=frontend-builder /app/public /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Create non-root user for security
RUN addgroup -g 1001 -S nginx-app && \
    adduser -S nginx-app -u 1001 -G nginx-app && \
    chown -R nginx-app:nginx-app /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Stage 4: Production backend API server
FROM node:18-alpine AS backend-production

# Install security updates and monitoring tools
RUN apk update && apk upgrade && apk add --no-cache \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodeapp && \
    adduser -S nodeapp -u 1001 -G nodeapp

# Copy built backend from backend-builder stage
COPY --from=backend-builder --chown=nodeapp:nodeapp /backend ./

# Set up logging directory
RUN mkdir -p /app/logs && chown nodeapp:nodeapp /app/logs

# Switch to non-root user
USER nodeapp

# Health check for API
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3001}/health || exit 1

# Expose API port
EXPOSE 3001

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]