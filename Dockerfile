# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/canonical-profile/package.json packages/canonical-profile/
COPY packages/db/package.json packages/db/
COPY packages/domain/package.json packages/domain/
COPY packages/evidence/package.json packages/evidence/
COPY packages/rfid-cfs/package.json packages/rfid-cfs/
COPY packages/slicer-creality/package.json packages/slicer-creality/
COPY packages/slicer-orca/package.json packages/slicer-orca/
# Bridge is local-only; stub package.json not required in image
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm -r --filter './packages/*' build \
  && pnpm --filter @open-filament/api build \
  && pnpm --filter @open-filament/web build

FROM base AS api
ENV NODE_ENV=production
ENV API_HOST=0.0.0.0
ENV API_PORT=8787
WORKDIR /app
COPY --from=build /app /app
RUN mkdir -p /data
ENV DATABASE_URL=file:/data/open-filament.sqlite
EXPOSE 8787
CMD ["pnpm", "--filter", "@open-filament/api", "start"]

FROM base AS web
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /app /app
EXPOSE 3000
CMD ["pnpm", "--filter", "@open-filament/web", "start"]
