#!/bin/bash

# Deploy Tailore Service with Docker

echo "🚀 Deploying Tailore Service..."

# Stop & remove old container if exists
docker stop tailore-integration-flori 2>/dev/null
docker rm tailore-integration-flori 2>/dev/null

# Build image
echo "📦 Building image..."
docker build -t tailore-service-flori .

# Run container
echo "▶️  Starting container..."
docker run -d \
  --name tailore-integration-flori \
  -p 5001:5001 \
  -e NODE_ENV=production \
  -e PORT=5001 \
  --restart unless-stopped \
  tailore-service-flori

# Show status
echo "✅ Deployment complete!"
docker ps | grep tailore-integration-flori
echo ""
echo "📍 Access at: http://localhost:5001"
echo "📋 View logs: docker logs -f tailore-integration-flori"
