# Build aşaması
FROM node:18-alpine AS builder

WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci --only=production=false

# .env dosyasını kopyala (varsa)
COPY .env* ./

# Kaynak kodları kopyala
COPY . .

# Production build oluştur
RUN npm run build

# Production aşaması - serve ile serve et
FROM node:18-alpine

# curl'ü health check için yükle
RUN apk add --no-cache curl

# serve paketini global olarak yükle
RUN npm install -g serve

WORKDIR /app

# Build çıktısını kopyala
COPY --from=builder /app/build ./build

# Port 7764'i expose et
EXPOSE 7764

# serve ile SPA routing desteği ile çalıştır
CMD ["serve", "-s", "build", "-l", "7764"]

