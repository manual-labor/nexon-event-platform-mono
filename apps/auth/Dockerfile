# Builder stage
FROM --platform=${BUILDPLATFORM:-linux/amd64} node:18-alpine AS builder
WORKDIR /workspace

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm fetch

# 전체 패키지 설치
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build:auth

# Runner stage
FROM --platform=${TARGETPLATFORM:-linux/amd64} node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /workspace/apps/auth/dist ./
COPY --from=builder /workspace/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "main.js"]

