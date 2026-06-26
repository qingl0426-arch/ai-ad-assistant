#!/bin/bash
cat > /etc/nginx/sites-enabled/ai-ad-assistant << 'ENDOFFILE'
server {
    listen 80;
    listen [::]:80;
    server_name wqaihub.cn;
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type text/plain;
    }
    location / { return 301 https://$host$request_uri; }
}
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name wqaihub.cn;
    ssl_certificate     /etc/letsencrypt/live/wqaihub.cn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wqaihub.cn/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    access_log /var/log/nginx/ai-ad-assistant-access.log combined buffer=16k flush=5s;
    error_log  /var/log/nginx/ai-ad-assistant-error.log warn;
    client_max_body_size 50M;
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml image/svg+xml font/woff2 font/woff;
    location /_next/static {
        alias /opt/ai-ad-assistant/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_buffering off;
        add_header Cache-Control "no-store" always;
    }
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_connect_timeout 5s;
        proxy_buffering on;
        proxy_cache_bypass $http_upgrade;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
    }
}
server {
    listen 80;
    server_name www.wqaihub.cn;
    return 301 https://wqaihub.cn$request_uri;
}
server {
    listen 443 ssl http2;
    server_name www.wqaihub.cn;
    ssl_certificate     /etc/letsencrypt/live/wqaihub.cn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wqaihub.cn/privkey.pem;
    return 301 https://wqaihub.cn$request_uri;
}
ENDOFFILE
nginx -t && nginx -s reload && echo "NGINX RELOADED"
