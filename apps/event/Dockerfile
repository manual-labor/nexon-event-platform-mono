# Builder stage
FROM --platform=${BUILDPLATFORM:-linux/amd64} node:18-alpine AS builder
WORKDIR /workspace

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm fetch

COPY apps/event/package.json apps/event/
RUN pnpm install --frozen-lockfile --filter "@nexon-event-platform-mono/event...*"

COPY . .
RUN pnpm build event

# Runner stage
FROM --platform=${TARGETPLATFORM:-linux/amd64} node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /workspace/apps/event/dist ./
COPY --from=builder /workspace/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 3001
CMD ["node", "main.js"]
