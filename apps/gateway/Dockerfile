# Builder stage
FROM --platform=${BUILDPLATFORM:-linux/amd64} node:18-alpine AS builder
WORKDIR /workspace

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm fetch

COPY apps/gateway/package.json apps/gateway/
RUN pnpm install --frozen-lockfile --filter "@nexon-event-platform-mono/gateway...*"

COPY . .
RUN pnpm build gateway

# Runner stage
FROM --platform=${TARGETPLATFORM:-linux/amd64} node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /workspace/apps/gateway/dist ./
COPY --from=builder /workspace/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 3002
CMD ["node", "main.js"]
