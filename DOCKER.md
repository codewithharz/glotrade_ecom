# Docker Deployment Guide

This guide explains how to run the entire platform using Docker and Docker Compose.

## Prerequisites

- Docker installed (v20.10+)
- Docker Compose installed (v2.0+)
- At least 4GB RAM available
- At least 10GB disk space

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/afritrade.git
cd afritrade
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp env.docker.example .env

# Edit .env with your values
nano .env
```

**Required environment variables:**
```env
MONGO_ROOT_PASSWORD=your_secure_password
JWT_SECRET=your_32_char_secret_key
PAYSTACK_SECRET_KEY=sk_live_xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxx
```

### 3. Build and Run

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

## Services

### MongoDB
- **Port**: 27017
- **Database**: afritrade
- **User**: admin
- **Password**: From `MONGO_ROOT_PASSWORD` env var

### API (Backend)
- **Port**: 5000
- **Health Check**: http://localhost:5000/health
- **Technology**: Node.js + Express + TypeScript

### Web (Frontend)
- **Port**: 3000
- **Technology**: Next.js 14 + React + TypeScript

## Common Commands

### Start Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d api
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f mongodb
```

### Rebuild After Code Changes
```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build api
docker-compose build web

# Rebuild and restart
docker-compose up -d --build
```

### Execute Commands in Container
```bash
# Access API container shell
docker-compose exec api sh

# Access Web container shell
docker-compose exec web sh

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p your_password
```

## Development vs Production

### Development Mode

For development, it's better to run services locally:

```bash
# Terminal 1: Start MongoDB only
docker-compose up mongodb

# Terminal 2: Run API locally
cd apps/api
yarn dev

# Terminal 3: Run Web locally
cd apps/web
yarn dev
```

### Production Mode

For production, use the full Docker Compose setup:

```bash
# Build for production
docker-compose build

# Start with production profile
docker-compose --profile production up -d

# This includes Nginx reverse proxy
```

## Nginx Reverse Proxy (Optional)

To use Nginx as a reverse proxy:

1. Create `nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:5000;
    }

    upstream web {
        server web:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        location /api {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location / {
            proxy_pass http://web;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

2. Start with production profile:
```bash
docker-compose --profile production up -d
```

## Database Management

### Backup Database

```bash
# Create backup
docker-compose exec mongodb mongodump \
  --uri="mongodb://admin:your_password@localhost:27017/afritrade?authSource=admin" \
  --out=/data/backup

# Copy backup to host
docker cp afritrade-mongodb:/data/backup ./backup
```

### Restore Database

```bash
# Copy backup to container
docker cp ./backup afritrade-mongodb:/data/backup

# Restore
docker-compose exec mongodb mongorestore \
  --uri="mongodb://admin:your_password@localhost:27017/afritrade?authSource=admin" \
  /data/backup/afritrade
```

### Access MongoDB Shell

```bash
docker-compose exec mongodb mongosh \
  -u admin \
  -p your_password \
  --authenticationDatabase admin \
  afritrade
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :5000
lsof -i :27017

# Kill process
kill -9 <PID>
```

### Container Won't Start

```bash
# Check logs
docker-compose logs api
docker-compose logs web

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart api
```

### Database Connection Failed

1. Ensure MongoDB is running:
```bash
docker-compose ps mongodb
```

2. Check MongoDB logs:
```bash
docker-compose logs mongodb
```

3. Verify connection string in `.env`

### Build Fails

```bash
# Clean Docker cache
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
```

## Performance Optimization

### Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Volume Optimization

Use named volumes for better performance:

```yaml
volumes:
  mongodb_data:
    driver: local
  node_modules_api:
    driver: local
  node_modules_web:
    driver: local
```

## Security Best Practices

1. **Never commit `.env` file**
2. **Use strong passwords** for MongoDB
3. **Rotate JWT secrets** regularly
4. **Keep Docker images updated**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```
5. **Use Docker secrets** for production:
   ```yaml
   secrets:
     jwt_secret:
       file: ./secrets/jwt_secret.txt
   ```

## Monitoring

### Health Checks

All services have health checks configured. View status:

```bash
docker-compose ps
```

Healthy services show `(healthy)` status.

### Resource Usage

```bash
# View resource usage
docker stats

# Specific container
docker stats afritrade-api
```

## Scaling

### Horizontal Scaling

Scale specific services:

```bash
# Scale API to 3 instances
docker-compose up -d --scale api=3

# Note: Requires load balancer (Nginx)
```

### Vertical Scaling

Increase resources in `docker-compose.yml`:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

## Migration from Local to Docker

1. **Export local database**:
```bash
mongodump --uri="mongodb://localhost:27017/afritrade" --out=./backup
```

2. **Start Docker services**:
```bash
docker-compose up -d
```

3. **Import to Docker MongoDB**:
```bash
docker cp ./backup afritrade-mongodb:/data/backup
docker-compose exec mongodb mongorestore \
  --uri="mongodb://admin:password@localhost:27017/afritrade?authSource=admin" \
  /data/backup/afritrade
```

## Cleanup

### Remove All Containers and Volumes

```bash
# Stop and remove everything
docker-compose down -v

# Remove unused images
docker image prune -a

# Remove all Docker data (WARNING: nuclear option)
docker system prune -a --volumes
```

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables in `.env`
3. Ensure ports are not in use
4. Try rebuilding: `docker-compose build --no-cache`

## Next Steps

- For cloud deployment, see `DEPLOYMENT.md`
- For production checklist, see `PRODUCTION_CHECKLIST.md`
- For detailed deployment guide, see `DEPLOYMENT_DETAILED.md`

---

**Happy Dockerizing! 🐳**
