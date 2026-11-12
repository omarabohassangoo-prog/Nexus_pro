# إضافة إلى docs/deployment.md

## SSL / HTTPS

```bash
# باستخدام Certbot + nginx
sudo certbot --nginx -d your-domain.com
```

`nginx.conf` — أضف:
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    # ... باقي الإعدادات
}
server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

## CI/CD
- `.github/workflows/ci.yml` — lint + test + build على كل PR
- `.github/workflows/deploy.yml` — بناء Docker image على tags v*

## Rollback
```bash
docker compose down
git checkout <previous-tag>
docker compose up -d --build
```
