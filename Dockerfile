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

# Production aşaması - Nginx ile serve et
FROM nginx:alpine

# Build çıktısını nginx'e kopyala
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx konfigürasyonunu kopyala (opsiyonel - SPA routing için)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Port 80'i expose et
EXPOSE 80

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]

