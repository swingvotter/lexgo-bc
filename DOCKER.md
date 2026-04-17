# Docker Deployment Guide

## Overview
This guide explains how to run LexGo using Docker and Docker Compose with Redis in a container and MongoDB Atlas as the database.

---

## Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)
- MongoDB Atlas account with a cluster set up
- Environment variables configured

---

## Quick Start

### 1. Clone and Setup Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values
nano .env
```

### 2. Configure MongoDB Atlas

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a cluster (if not already created)
3. Get your connection string
4. Add your IP address to the whitelist (or allow access from anywhere: `0.0.0.0/0`)
5. Update `MONGODB_URI` in `.env` with your connection string

Example:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/lexgo?retryWrites=true&w=majority
```

### 3. Build and Run

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View app logs only
docker-compose logs -f app

# View Redis logs only
docker-compose logs -f redis
```

### 4. Verify Services

```bash
# Check running containers
docker-compose ps

# Test the API
curl http://localhost:3000/api/v1/Health
```

---

## Docker Services

### App Service
- **Container Name**: `lexgo-app`
- **Port**: `3000:3000`
- **Image**: Built from local Dockerfile
- **Restart Policy**: `unless-stopped`
- **Volumes**: `./logs:/app/logs` (for persistent logs)

### Redis Service
- **Container Name**: `lexgo-redis`
- **Port**: `6379:6379`
- **Image**: `redis:7-alpine`
- **Restart Policy**: `unless-stopped`
- **Persistence**: Enabled with AOF (Append Only File)
- **Volume**: `redis-data:/data` (persistent storage)
- **Health Check**: Pings Redis every 10 seconds

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for access tokens | `your-secret-key` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | `your-refresh-secret` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_PASSWORD` | Redis password | Empty (no auth) |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Email username | - |
| `EMAIL_PASSWORD` | Email password | - |
| `EMAIL_FROM` | From email address | - |

---

## Docker Commands

### Start Services
```bash
# Start in detached mode
docker-compose up -d

# Start with build
docker-compose up -d --build

# Start specific service
docker-compose up -d app
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific service
docker-compose stop app
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart app
```

### Execute Commands
```bash
# Access app container shell
docker-compose exec app sh

# Access Redis CLI
docker-compose exec redis redis-cli

# Run npm commands
docker-compose exec app npm run <script>
```

---

## Volume Management

### Redis Data Volume
Redis data is persisted in a Docker volume named `redis-data`.

```bash
# List volumes
docker volume ls

# Inspect Redis volume
docker volume inspect lexgo_redis-data

# Backup Redis data
docker run --rm -v lexgo_redis-data:/data -v $(pwd):/backup alpine tar czf /backup/redis-backup.tar.gz -C /data .

# Restore Redis data
docker run --rm -v lexgo_redis-data:/data -v $(pwd):/backup alpine tar xzf /backup/redis-backup.tar.gz -C /data
```

### Application Logs
Logs are mounted from `./logs` on the host to `/app/logs` in the container.

```bash
# View logs directory
ls -la ./logs

# Clear logs
rm -rf ./logs/*
```

---

## Redis Configuration

### Connection in Docker
When running in Docker, the app connects to Redis using:
- **Host**: `redis` (service name)
- **Port**: `6379`
- **Password**: Set via `REDIS_PASSWORD` (optional)

### Redis Persistence
Redis is configured with AOF (Append Only File) for data persistence:
- Data is saved to `/data` in the container
- Mounted to `redis-data` volume on the host
- Survives container restarts

### Redis Health Check
Redis health is monitored automatically:
- Interval: 10 seconds
- Timeout: 3 seconds
- Retries: 3 attempts

---

## Switching from Cloud Redis to Docker Redis

If you're currently using a cloud Redis provider (e.g., Upstash, Redis Cloud), update your configuration:

### Before (Cloud Redis)
```env
REDIS_HOST=your-cloud-redis.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-cloud-password
```

### After (Docker Redis)
```env
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
```

The app will automatically connect to the Docker Redis container.

---

## Production Deployment

### Security Recommendations

1. **Set Redis Password**
   ```env
   REDIS_PASSWORD=strong-random-password
   ```

2. **Use Strong JWT Secrets**
   ```bash
   # Generate random secrets
   openssl rand -base64 32
   ```

3. **Restrict MongoDB Atlas Access**
   - Add only your server's IP to the whitelist
   - Use strong database credentials

4. **Use Environment Variables**
   - Never commit `.env` to version control
   - Use secrets management in production

### Performance Optimization

1. **Increase Redis Memory**
   ```yaml
   redis:
     command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
   ```

2. **Scale App Instances**
   ```bash
   docker-compose up -d --scale app=3
   ```

3. **Use Nginx Reverse Proxy**
   Add Nginx service to `docker-compose.yml` for load balancing

---

## Monitoring

### Check Service Health
```bash
# Check all services
docker-compose ps

# Check Redis health
docker-compose exec redis redis-cli ping

# Check app health
curl http://localhost:3000/api/v1/Health
```

### Monitor Resource Usage
```bash
# View resource usage
docker stats

# View specific container
docker stats lexgo-app
```

---

## Troubleshooting

### App Won't Start
```bash
# Check logs
docker-compose logs app

# Verify environment variables
docker-compose exec app env | grep MONGODB_URI

# Rebuild container
docker-compose up -d --build
```

### Redis Connection Issues
```bash
# Test Redis connection
docker-compose exec redis redis-cli ping

# Check Redis logs
docker-compose logs redis

# Verify network
docker network inspect lexgo_lexgo-network
```

### MongoDB Connection Issues
```bash
# Test MongoDB connection from app
docker-compose exec app node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(err => console.error(err))"

# Check MongoDB Atlas network access
# Ensure 0.0.0.0/0 or your server IP is whitelisted
```

### Port Already in Use
```bash
# Change port in docker-compose.yml
ports:
  - "8080:3000"  # Use port 8080 instead
```

---

## Migration to Self-Hosted MongoDB

When ready to host MongoDB in Docker:

1. Add MongoDB service to `docker-compose.yml`:
```yaml
  mongodb:
    image: mongo:7
    container_name: lexgo-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: lexgo
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - lexgo-network

volumes:
  mongo-data:
    driver: local
```

2. Update `.env`:
```env
MONGODB_URI=mongodb://admin:password@mongodb:27017/lexgo?authSource=admin
```

3. Restart services:
```bash
docker-compose down
docker-compose up -d
```

---

## Backup and Restore

### Backup Redis
```bash
docker-compose exec redis redis-cli BGSAVE
docker cp lexgo-redis:/data/dump.rdb ./backup/redis-dump.rdb
```

### Backup Logs
```bash
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/
```

---

## Clean Up

### Remove All Containers and Volumes
```bash
# Stop and remove everything
docker-compose down -v

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

### Remove Specific Volume
```bash
docker volume rm lexgo_redis-data
```

---

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Verify environment variables
- Ensure MongoDB Atlas is accessible
- Check Redis health: `docker-compose exec redis redis-cli ping`
