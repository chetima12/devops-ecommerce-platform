FROM node:22-alpine AS builder

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm install --omit=dev --ignore-scripts \
    && npm cache clean --force

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

RUN apk upgrade --no-cache \
  && rm -rf /usr/local/lib/node_modules/npm \
        /usr/local/lib/node_modules/corepack \
        /usr/local/bin/npm \
        /usr/local/bin/npx \
        /opt/yarn-* \
        /usr/local/bin/yarn \
        /usr/local/bin/yarnpkg

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node src ./src

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/api/health', response => process.exit(response.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/server.js"]
