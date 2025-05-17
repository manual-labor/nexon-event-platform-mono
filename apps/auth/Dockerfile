# Builder stage
FROM --platform=${BUILDPLATFORM:-linux/amd64} node:18-alpine AS builder
WORKDIR /workspace

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm fetch

COPY apps/auth/package.json apps/auth/
RUN pnpm install --frozen-lockfile --filter "@nexon-event-platform-mono/auth...*"

COPY . .
RUN pnpm build auth

# Runner stage
FROM --platform=${TARGETPLATFORM:-linux/amd64} node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /workspace/apps/auth/dist ./
COPY --from=builder /workspace/node_modules ./node_modules
# Proto 파일 복사
COPY --from=builder /workspace/apps/auth/src/proto/ ./proto/

ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "main.js"]

