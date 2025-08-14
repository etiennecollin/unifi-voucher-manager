#!/usr/bin/env sh

echo "================================================================"
echo "Starting services..."
echo "Frontend will listen on: ${FRONTEND_BIND_HOST}:${FRONTEND_BIND_PORT}"
echo "Backend will listen on: ${BACKEND_BIND_HOST}:${BACKEND_BIND_PORT}"
echo "================================================================"

# Start backend in background
echo "Starting backend..."
./backend &
BACKEND_PID=$!

# Wait for backend to initialize
sleep 3

# Start frontend in foreground
echo "Starting frontend..."
NEXT_TELEMETRY_DISABLED="1" NODE_ENV="production" \
  HOSTNAME="${FRONTEND_BIND_HOST}" PORT="${FRONTEND_BIND_PORT}" \
  node ./frontend/server.js &
FRONTEND_PID=$!

cleanup() {
  echo "================================================================"
  echo "Shutting down services..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo "Frontend and Backend services have been shut down."
  echo "================================================================"
  exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Wait for any process to exit
wait $BACKEND_PID $FRONTEND_PID

# Exit with status of process that exited first
exit $?
