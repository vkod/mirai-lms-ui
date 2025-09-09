# Docker Deployment Guide for Mirai LMS UI

This guide explains how to build and deploy the Mirai LMS UI application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier deployment)
- API backend running (default: http://localhost:8000)

## Quick Start

### 1. Build the Docker Image

```bash
# Build with default settings
npm run docker:build

# Or build with custom API URL
VITE_API_URL=https://api.your-domain.com npm run docker:build:prod
```

### 2. Run the Container

```bash
# Run with default settings (API at http://localhost:8000)
npm run docker:run:dev

# Or run with environment file
npm run docker:run
```

### 3. Using Docker Compose

```bash
# Start the application
npm run docker:compose:up

# View logs
npm run docker:compose:logs

# Stop the application
npm run docker:compose:down
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_URL=http://your-api-server:8000
PORT=3000  # Port to expose the UI (default: 3000)
```

### Build Arguments

When building the Docker image, you can pass build arguments:

```bash
docker build \
  --build-arg VITE_API_URL=https://api.production.com \
  -t mirai-lms-ui:latest .
```

## Production Deployment

### Using Docker Compose for Production

```bash
# Deploy with production configuration
npm run docker:compose:prod

# Or manually with both compose files
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Manual Docker Commands

```bash
# Build the image
docker build -t mirai-lms-ui:latest .

# Run the container
docker run -d \
  --name mirai-lms-ui \
  -p 80:80 \
  -e VITE_API_URL=https://api.production.com \
  --restart unless-stopped \
  mirai-lms-ui:latest
```

## Multi-Stage Build

The Dockerfile uses a multi-stage build process:

1. **Builder Stage**: Installs dependencies and builds the React application
2. **Production Stage**: Uses nginx to serve the static files

This approach results in a smaller final image (~25MB) containing only the necessary files.

## Nginx Configuration

The nginx configuration (`nginx.conf`) includes:

- Gzip compression for better performance
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Client-side routing support
- Static asset caching (1 year for JS/CSS/images)
- Health check endpoint at `/health`

## Health Checks

The container includes health checks that can be monitored:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' mirai-lms-ui

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' mirai-lms-ui
```

## Troubleshooting

### Container won't start
- Check logs: `docker logs mirai-lms-ui`
- Verify port availability: `netstat -an | grep 3000`

### API connection issues
- Ensure the API URL is correct in environment variables
- Check network connectivity between containers
- Verify CORS settings on the API server

### Build failures
- Clear Docker cache: `docker system prune`
- Rebuild without cache: `docker build --no-cache -t mirai-lms-ui .`

## Security Considerations

1. **Never expose sensitive data in environment variables**
2. **Use HTTPS in production**
3. **Implement proper CORS policies**
4. **Regularly update base images**
5. **Scan images for vulnerabilities**: `docker scan mirai-lms-ui:latest`

## Deployment Platforms

### Docker Swarm

```bash
docker service create \
  --name mirai-lms-ui \
  --replicas 3 \
  --publish 80:80 \
  --env VITE_API_URL=https://api.production.com \
  mirai-lms-ui:latest
```

### Kubernetes

See `kubernetes.yaml` (if provided) for Kubernetes deployment configuration.

### Cloud Platforms

- **AWS ECS**: Use the Docker image with ECS task definitions
- **Google Cloud Run**: Deploy directly from the container registry
- **Azure Container Instances**: Deploy using Azure CLI or portal
- **Heroku**: Use `heroku.yml` with the Dockerfile

## Monitoring

Consider implementing:
- Application monitoring (e.g., Sentry, LogRocket)
- Container monitoring (e.g., Prometheus, Grafana)
- Log aggregation (e.g., ELK stack, CloudWatch)

## Updates and Maintenance

1. Pull latest code: `git pull origin main`
2. Rebuild image: `npm run docker:build:prod`
3. Stop old container: `docker stop mirai-lms-ui`
4. Start new container: `npm run docker:run`
5. Verify deployment: Check `/health` endpoint

## Support

For issues or questions, please check the main README or open an issue in the repository.