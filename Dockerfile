FROM oven/bun:1.3.9-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN bun install --frozen-lockfile --production


FROM oven/bun:1.3.9-alpine AS builder

ARG DATABASE_URL
ARG SECRET_KEY

ENV DATABASE_URL=${DATABASE_URL}
ENV SECRET_KEY=${SECRET_KEY}

WORKDIR /app

COPY package*.json ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build


FROM oven/bun:1.3.9-alpine AS runner

WORKDIR /app

RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./
COPY --from=builder --chown=appuser:appgroup /app/.next ./.next
COPY --from=builder --chown=appuser:appgroup /app/next.config.ts ./
COPY --from=builder --chown=appuser:appgroup /app/tailwind.config.ts ./
COPY --from=builder --chown=appuser:appgroup /app/tsconfig.json ./
COPY --from=builder --chown=appuser:appgroup /app/postcss.config.mjs ./
COPY --from=builder --chown=appuser:appgroup /app/drizzle.config.ts ./
COPY --from=builder --chown=appuser:appgroup /app/drizzle ./drizzle
COPY --from=builder --chown=appuser:appgroup /app/lib ./lib
COPY --from=builder --chown=appuser:appgroup /app/app ./app
COPY --from=builder --chown=appuser:appgroup /app/components ./components

USER appuser

EXPOSE 3000

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["bun", "run", "start"]
