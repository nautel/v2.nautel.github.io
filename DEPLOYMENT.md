# Production Deployment Guide

## Overview

This guide covers the complete production deployment process for the dual-theme Gatsby portfolio website with comprehensive theme system, monitoring, and security configurations.

## Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Frontend      │    │   Backend API   │
│   (Nginx/       │────│   (Gatsby +     │────│   (Node.js +    │
│   Traefik)      │    │   Theme System) │    │   Theme API)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         │              │   Theme Cache   │             │
         └──────────────│   (Redis)       │─────────────┘
                        └─────────────────┘
                                │
                    ┌─────────────────┐    ┌─────────────────┐
                    │   User Prefs    │    │   Analytics     │
                    │   (PostgreSQL)  │    │   (MongoDB)     │
                    └─────────────────┘    └─────────────────┘
```

### Key Features
- **Dual-Theme System**: Light/Dark theme with system preference detection
- **Advanced Caching**: Multi-layer caching strategy with Redis and CDN
- **Comprehensive Monitoring**: Prometheus, Grafana, and custom theme analytics
- **Security**: SSL termination, CORS, CSP, rate limiting, and security headers
- **Performance**: Optimized builds, lazy loading, and performance budgets

## Prerequisites

### Required Tools
- Docker and Docker Compose v3.8+
- Node.js 18+, Yarn or npm
- Git for version control
- SSL certificates for HTTPS

### Environment Setup

1. **Clone the repository**:
```bash
git clone https://github.com/nautel/v2.nautel.github.io.git
cd v4
```

2. **Configure environment variables**:
```bash
cp .env.example .env.production
# Edit .env.production with your production values
```

3. **Generate SSL certificates** (using Let's Encrypt):
```bash
mkdir -p ssl
# Place your SSL certificates in ssl/cert.pem and ssl/key.pem
```

## Deployment Methods

### Method 1: Docker Compose (Recommended)

#### Quick Start
```bash
# Build and start all services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

#### Step-by-Step Deployment

1. **Build Docker images**:
```bash
# Build frontend
docker build -t portfolio-frontend:latest --target frontend-production .

# Build backend
docker build -t portfolio-backend:latest --target backend-production .
```

2. **Start infrastructure services**:
```bash
docker-compose -f docker-compose.prod.yml up -d database redis mongodb
```

3. **Initialize databases**:
```bash
# Run database migrations
docker-compose exec database psql -U $DB_USER -d $DB_NAME -f /docker-entrypoint-initdb.d/init.sql

# Verify connections
docker-compose exec backend npm run health-check
```

4. **Deploy application services**:
```bash
# Start backend API
docker-compose -f docker-compose.prod.yml up -d backend

# Start frontend
docker-compose -f docker-compose.prod.yml up -d frontend

# Start reverse proxy
docker-compose -f docker-compose.prod.yml up -d traefik
```

5. **Start monitoring stack**:
```bash
docker-compose -f docker-compose.prod.yml up -d prometheus grafana
```

### Method 2: Kubernetes Deployment

#### Prerequisites
- Kubernetes cluster (v1.24+)
- kubectl configured
- Helm 3+ (optional but recommended)

#### Deploy with kubectl
```bash
# Create namespace
kubectl create namespace portfolio

# Apply configurations
kubectl apply -f k8s/configmaps/
kubectl apply -f k8s/secrets/
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress/

# Check deployment status
kubectl get pods -n portfolio
```

### Method 3: GitHub Actions CI/CD

#### Automated Deployment Pipeline

The project includes comprehensive GitHub Actions workflows:

1. **`.github/workflows/deploy.yml`**: Production deployment pipeline
2. **`.github/workflows/ci-cd.yml`**: Comprehensive testing and quality checks

#### Required Secrets

Configure these secrets in your GitHub repository:

```
# Application
GATSBY_THEME_API_URL=https://api.nautel.dev/api/v1
GA_TRACKING_ID=UA-XXXXXXXXX-X
SENTRY_DSN=https://your-sentry-dsn

# Database
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://user:pass@host:port
MONGODB_URI=mongodb://user:pass@host:port/db

# Security
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# Monitoring
GRAFANA_ADMIN_PASSWORD=your-grafana-password
SLACK_WEBHOOK_URL=https://hooks.slack.com/your-webhook

# GitHub Container Registry
GITHUB_TOKEN=automatic-token
```

#### Trigger Deployment

```bash
# Push to main branch triggers production deployment
git push origin main

# Create release for tagged deployment
git tag v1.0.0
git push origin v1.0.0
```

## Configuration

### Environment Variables

#### Frontend Configuration
```bash
# Core settings
NODE_ENV=production
GATSBY_SITE_URL=https://nautel.dev
GATSBY_THEME_API_URL=https://api.nautel.dev/api/v1

# Analytics and monitoring
GATSBY_GA_TRACKING_ID=UA-XXXXXXXXX-X
GATSBY_SENTRY_DSN=https://your-sentry-dsn
GATSBY_ANALYTICS_ENABLED=true

# Performance features
GATSBY_CDN_URL=https://cdn.nautel.dev
GATSBY_ENABLE_THEME_TRANSITIONS=true
GATSBY_ENABLE_SYSTEM_THEME_DETECTION=true
```

#### Backend Configuration
```bash
# Server settings
PORT=3001
NODE_ENV=production
LOG_LEVEL=warn

# Database connections
DATABASE_URL=postgresql://username:password@db:5432/portfolio
REDIS_URL=redis://username:password@redis:6379
MONGODB_URI=mongodb://username:password@mongodb:27017/analytics

# Security
JWT_SECRET=your-very-secure-jwt-secret
CORS_ORIGIN=https://nautel.dev,https://www.nautel.dev
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Nginx Configuration

The production Nginx configuration (`nginx/prod.conf`) includes:

- **SSL termination** with modern TLS settings
- **HTTP/2 support** for improved performance
- **Security headers** (CSP, HSTS, X-Frame-Options, etc.)
- **Rate limiting** for API endpoints
- **Caching strategies** for static assets and theme data
- **Compression** with gzip and Brotli
- **Load balancing** for backend services

### Database Setup

#### PostgreSQL (User Preferences)
```sql
-- Create theme preferences table
CREATE TABLE theme_preferences (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE,
    theme VARCHAR(50) NOT NULL DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for fast lookups
CREATE INDEX idx_theme_preferences_user_id ON theme_preferences(user_id);
```

#### Redis (Caching)
```bash
# Theme cache keys
theme:user:{user_id}        # User theme preference
theme:analytics:daily       # Daily theme usage stats
theme:system:detection      # System theme detection cache
```

#### MongoDB (Analytics)
```javascript
// Theme usage collection
db.theme_usage.createIndex({ "timestamp": 1, "theme": 1 })
db.theme_usage.createIndex({ "user_id": 1 })

// Performance metrics collection
db.theme_performance.createIndex({ "timestamp": 1, "metric_type": 1 })
```

## Monitoring and Observability

### Prometheus Metrics

The system exposes comprehensive metrics:

```
# Theme-specific metrics
theme_preference_total                    # Total theme preferences stored
theme_switch_total{theme}                # Theme switches by type
theme_transition_duration_seconds        # Theme transition performance
theme_cache_hits_total                   # Cache performance
theme_api_requests_total{endpoint,status} # API usage

# Application metrics
http_request_duration_seconds            # Request latency
http_requests_total{method,route,status} # Request volume
process_resident_memory_bytes            # Memory usage
```

### Grafana Dashboards

Pre-configured dashboards include:

1. **Theme System Overview**: Usage patterns, performance metrics
2. **Application Performance**: Response times, error rates, throughput
3. **Infrastructure Health**: System resources, database performance
4. **Security Monitoring**: Rate limiting, failed authentications

### Log Aggregation

Logs are collected using the ELK stack:

- **Elasticsearch**: Log storage and indexing
- **Kibana**: Log visualization and analysis
- **Fluentd**: Log collection and forwarding

### Health Checks

All services include comprehensive health checks:

```bash
# Application health
curl https://nautel.dev/health

# API health
curl https://api.nautel.dev/health

# Database health
docker-compose exec database pg_isready

# Redis health
docker-compose exec redis redis-cli ping
```

## Performance Optimization

### Caching Strategy

#### 1. Browser Caching
```nginx
# Static assets: 1 year cache
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# HTML: Short cache with revalidation
location ~* \.html$ {
    expires 1h;
    add_header Cache-Control "public, max-age=3600, must-revalidate";
}
```

#### 2. CDN Configuration
```javascript
// Cloudflare cache rules
const cacheRules = {
  '*.js': '1 year',
  '*.css': '1 year',
  '*.png|*.jpg|*.jpeg': '1 month',
  '/api/v1/themes/preferences': '5 minutes',
  '/api/v1/themes/available': '1 hour'
}
```

#### 3. Redis Caching
```javascript
// Theme preference caching
const cacheKey = `theme:user:${userId}`;
const ttl = 3600; // 1 hour

// API response caching
const apiCacheKey = `api:themes:available`;
const apiTtl = 1800; // 30 minutes
```

### Performance Budgets

Lighthouse CI enforces these budgets:

```javascript
// Performance budgets
const budgets = {
  'first-contentful-paint': 2000,      // 2 seconds
  'largest-contentful-paint': 2500,    // 2.5 seconds
  'total-blocking-time': 300,          // 300ms
  'cumulative-layout-shift': 0.1,      // 0.1 CLS score
  'unused-css-rules': 20000,           // 20KB unused CSS
  'unused-javascript': 30000           // 30KB unused JS
};
```

## Security

### SSL/TLS Configuration

```nginx
# Modern SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
ssl_stapling on;
ssl_stapling_verify on;
```

### Security Headers

```nginx
# Security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "..." always;
```

### Rate Limiting

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=theme_switch:10m rate=5r/s;

# Apply rate limiting
location /api/v1/themes {
    limit_req zone=theme_switch burst=20 nodelay;
}
```

## Backup and Recovery

### Automated Backup Strategy

```bash
# Database backup script (runs daily at 2 AM)
#!/bin/bash
BACKUP_DIR="/backups/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

# PostgreSQL backup
pg_dump -U $DB_USER -h database $DB_NAME > "$BACKUP_DIR/postgres.sql"

# MongoDB backup
mongodump --host mongodb:27017 --out "$BACKUP_DIR/mongodb"

# Compress backups
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"
rm -rf "$BACKUP_DIR"

# Upload to cloud storage
aws s3 cp "$BACKUP_DIR.tar.gz" s3://your-backup-bucket/
```

### Recovery Procedures

#### 1. Database Recovery
```bash
# Restore PostgreSQL
psql -U $DB_USER -h database $DB_NAME < backup.sql

# Restore MongoDB
mongorestore --host mongodb:27017 backup/mongodb/
```

#### 2. Application Recovery
```bash
# Rollback to previous Docker image
docker-compose pull portfolio-frontend:previous
docker-compose up -d frontend

# Or rollback via Git
git revert HEAD
docker-compose build frontend
docker-compose up -d frontend
```

## Rollback Procedures

### Automated Rollback (GitHub Actions)

```yaml
# Rollback workflow
name: Rollback Production
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Rollback Docker images
        run: |
          docker pull ghcr.io/nautel/portfolio-frontend:${{ inputs.version }}
          docker service update --image ghcr.io/nautel/portfolio-frontend:${{ inputs.version }} portfolio_frontend
```

### Manual Rollback

```bash
# 1. Identify the previous working version
docker images | grep portfolio-frontend

# 2. Stop current services
docker-compose down

# 3. Update docker-compose.yml to use previous image
# image: portfolio-frontend:v1.2.3

# 4. Restart services
docker-compose up -d

# 5. Verify deployment
curl https://nautel.dev/health
```

### Database Rollback

```bash
# 1. Stop application services
docker-compose stop frontend backend

# 2. Restore database from backup
psql -U $DB_USER -h database $DB_NAME < backups/previous-backup.sql

# 3. Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL

# 4. Restart services
docker-compose up -d
```

## Troubleshooting

### Common Issues

#### 1. Theme API Not Responding
```bash
# Check API service status
docker-compose ps backend
docker-compose logs backend

# Check database connectivity
docker-compose exec backend npm run health-check

# Restart API service
docker-compose restart backend
```

#### 2. Frontend Theme Loading Issues
```bash
# Check Redis connectivity
docker-compose exec redis redis-cli ping

# Clear theme cache
docker-compose exec redis redis-cli DEL "theme:*"

# Rebuild frontend with cache reset
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

#### 3. Performance Issues
```bash
# Check resource usage
docker stats

# Review Prometheus metrics
curl http://localhost:9090/metrics

# Check Grafana dashboards
open http://localhost:3000
```

#### 4. SSL Certificate Issues
```bash
# Check certificate expiration
openssl x509 -in ssl/cert.pem -text -noout | grep "Not After"

# Renew Let's Encrypt certificate
certbot renew --nginx

# Restart nginx
docker-compose restart nginx-proxy
```

### Monitoring Commands

```bash
# Real-time application logs
docker-compose logs -f frontend backend

# System resource monitoring
docker stats --no-stream

# Database connection monitoring
docker-compose exec database psql -U $DB_USER -c "SELECT * FROM pg_stat_activity;"

# Redis memory usage
docker-compose exec redis redis-cli INFO memory

# Network connectivity tests
docker-compose exec frontend ping backend
```

### Emergency Procedures

#### 1. Complete Service Outage
```bash
# 1. Activate maintenance mode
echo "Service temporarily unavailable" > maintenance.html
# Configure nginx to serve maintenance page

# 2. Investigate root cause
docker-compose logs --tail=100

# 3. Emergency rollback if needed
git checkout previous-stable-commit
docker-compose down && docker-compose up -d

# 4. Notify stakeholders
# Send automated alerts via configured channels
```

#### 2. Data Corruption
```bash
# 1. Stop all services immediately
docker-compose down

# 2. Assess data integrity
docker-compose run --rm database pg_dump --schema-only

# 3. Restore from latest backup
# Follow backup recovery procedures

# 4. Restart services with health checks
docker-compose up -d
./scripts/health-check.sh
```

## Maintenance

### Regular Maintenance Tasks

#### Daily
- Monitor application logs for errors
- Check Grafana dashboards for anomalies
- Verify backup completion
- Review security alerts

#### Weekly
- Update dependency security patches
- Review performance metrics and optimize
- Clean up old Docker images and volumes
- Test backup restoration procedures

#### Monthly
- Update SSL certificates if needed
- Review and rotate secrets
- Conduct security vulnerability scans
- Update documentation and runbooks

### Scaling Considerations

#### Horizontal Scaling
```yaml
# Increase backend replicas
services:
  backend:
    deploy:
      replicas: 5
      
# Add load balancer configuration
nginx:
  upstream backend_servers:
    server backend_1:3001;
    server backend_2:3001;
    server backend_3:3001;
```

#### Database Scaling
```bash
# PostgreSQL read replicas
# Configure streaming replication
# Update connection strings for read queries

# Redis clustering
# Set up Redis Cluster mode
# Update Redis client configuration
```

## Support and Contact

### Team Contacts
- **DevOps Lead**: devops@nautel.dev
- **Security Team**: security@nautel.dev
- **On-Call Engineer**: +1-XXX-XXX-XXXX

### Documentation Updates
This deployment guide should be updated whenever:
- Infrastructure changes are made
- New services are added
- Security procedures are modified
- Performance optimizations are implemented

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Maintainer**: DevOps Team