#!/bin/sh
set -e

# Check backend health
echo "Checking backend on port $BACKEND_BIND_PORT..."
wget --no-verbose --tries=1 --spider --timeout=5 "http://localhost:$BACKEND_BIND_PORT/api/health" 2>/dev/null || {
  echo "Backend health check failed on port $BACKEND_BIND_PORT"
  exit 1
}

# Check frontend health
echo "Checking frontend on port $FRONTEND_BIND_PORT..."
wget --no-verbose --tries=1 --spider --timeout=5 "http://localhost:$FRONTEND_BIND_PORT" 2>/dev/null || {
  echo "Frontend health check failed on port $FRONTEND_BIND_PORT"
  exit 1
}

echo "Both services are healthy"
exit 0
