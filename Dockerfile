ARG NODE_VERSION=20.14.0

FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /usr/src/template

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build
RUN npm prune --production


FROM node:${NODE_VERSION}-alpine AS production

WORKDIR /usr/src/template

COPY --from=builder /usr/src/template/node_modules ./node_modules
COPY --from=builder /usr/src/template/dist ./dist
COPY --from=builder /usr/src/template/generated ./generated
COPY --from=builder /usr/src/template/package*.json ./
COPY --from=builder /usr/src/template/prisma ./prisma
COPY --from=builder /usr/src/template/.env ./

# Using the correct port from your application
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Run with module-alias for path aliases
CMD ["node", "-r", "module-alias/register", "dist/index.js"]
