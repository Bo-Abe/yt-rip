# Stage 1: Build frontend
FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build:client
RUN npm run build:server

# Stage 2: Production
FROM node:22-alpine AS production

RUN apk add --no-cache python3 ffmpeg
RUN wget -qO /usr/local/bin/yt-dlp https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    && chmod +x /usr/local/bin/yt-dlp

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Create tmp directory for conversions
RUN mkdir -p /app/tmp

ENV NODE_ENV=production
ENV PORT=3001
ENV TEMP_DIR=/app/tmp
ENV YTDLP_PATH=/usr/local/bin/yt-dlp
ENV FFMPEG_PATH=/usr/bin/ffmpeg

EXPOSE 3001

CMD ["node", "dist/server/server/index.js"]
