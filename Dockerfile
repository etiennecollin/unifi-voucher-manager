# ==============================================================================
# Base images
# ==============================================================================
FROM node:24.3-alpine AS node-base
FROM rust:1.88-alpine AS rust-base

# ==============================================================================
# Backend dependencies
# ==============================================================================
FROM rust-base AS rust-deps

RUN apk add --no-cache musl-dev pkgconfig openssl-dev openssl-libs-static

WORKDIR /app

COPY ./backend/Cargo.toml ./backend/Cargo.lock ./
# Create dummy src to satisfy cargo
RUN mkdir ./src && echo "fn main() {}" > ./src/main.rs

ENV OPENSSL_STATIC=1

# Build dependencies only (cache them)
RUN cargo build --release && rm -rf ./src/

# ==============================================================================
# Backend build
# ==============================================================================
FROM rust-deps AS rust-builder

# Now copy real source
COPY ./backend/src ./src

# Build only our code (dependencies already built)
RUN cargo build --release

# ==============================================================================
# Frontend dependencies
# ==============================================================================
FROM node-base AS node-deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY ./frontend/package.json ./frontend/yarn.lock* ./frontend/package-lock.json* ./frontend/pnpm-lock.yaml* ./frontend/.npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ==============================================================================
# Frontend build
# ==============================================================================
FROM node-base AS node-builder

WORKDIR /app

COPY --from=node-deps /app/node_modules ./node_modules
COPY ./frontend ./

ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ==============================================================================
# Runner
# ==============================================================================
FROM alpine:3.22 AS runtime
RUN apk add --no-cache ca-certificates wget nodejs

WORKDIR /app

RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copy run wrapper script
COPY ./scripts/run_wrapper.sh ./
RUN chmod +x run_wrapper.sh

# Create healthcheck script
COPY ./scripts/healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# Copy backend
COPY --from=rust-builder --chown=appuser:appgroup /app/target/release/backend ./backend

# Copy frontend
COPY --from=node-builder --chown=appuser:appgroup /app/public* ./frontend/public
COPY --from=node-builder --chown=appuser:appgroup /app/.next/standalone ./frontend
COPY --from=node-builder --chown=appuser:appgroup /app/.next/static ./frontend/.next/static

USER appuser

ENV FRONTEND_BIND_HOST="0.0.0.0"
ENV FRONTEND_BIND_PORT="3000"
ENV FRONTEND_TO_BACKEND_URL="http://127.0.0.1"
ENV BACKEND_BIND_HOST="127.0.0.1"
ENV BACKEND_BIND_PORT="8080"

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD /usr/local/bin/healthcheck.sh

CMD ["./run_wrapper.sh"]
