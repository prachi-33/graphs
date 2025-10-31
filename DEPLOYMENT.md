# Deployment Guide

This is a **100% static website** with no server-side code. It can be deployed to any static hosting provider.

## Quick Start

### Build
```bash
npm install
npm run build
```

The `dist/` folder contains your complete static website ready to deploy.

## Deploy to Vercel (Recommended)

Vercel is optimized for Vite projects and provides the best experience.

### Option 1: Using Vercel CLI

```bash
# Install Vercel CLI (one-time)
npm install -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Option 2: Using Vercel Web Dashboard

1. Push your code to GitHub, GitLab, or Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Vercel auto-detects Vite configuration
6. Click "Deploy"
7. Your site is live at a `.vercel.app` domain

### Option 3: GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Select your repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Click "Deploy site"

## Deploy to GitHub Pages

1. Update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/graph-visualizer/', // Replace with your repo name
  // ... rest of config
});
```

2. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Manual Deployment

### AWS S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t graph-visualizer .
docker run -p 80:80 graph-visualizer
```

### Traditional Web Server

For any web server (Apache, Nginx, etc.):

1. Build the project: `npm run build`
2. Upload the `dist/` folder to your server
3. Configure your web server to serve `dist/index.html` for all routes (for SPA routing)

#### Nginx Example

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/graph-visualizer/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Apache Example

Create `.htaccess` in the `dist/` folder:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Troubleshooting

### SPA Routing Issues

If you get 404s after refreshing on nested routes, your server needs to redirect all requests to `index.html`.

- **Vercel**: Automatic ✓
- **Netlify**: Automatic ✓
- **GitHub Pages**: Add `_redirects` file:
  ```
  /* /index.html 200
  ```
- **Other servers**: Configure rewrite rules (see examples above)

### Build Issues

```bash
# Clear cache and rebuild
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Environment Variables

This app has no server-side environment variables. If you need configuration, store it in `client/config.ts`:

```typescript
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
};
```

Use in components:
```typescript
import { config } from '@/config';
```

## Performance Tips

1. **Caching**: Built assets include content hashes
2. **Gzip**: Most hosting providers enable this automatically
3. **Image Optimization**: Use image optimizers if you add images
4. **Code Splitting**: Enabled by default with Vite
5. **SEO**: Static HTML is fully crawlable

## Custom Domains

### Vercel
1. Dashboard → Project Settings → Domains
2. Add your domain
3. Update DNS records

### Netlify
1. Domain Settings → Custom Domains
2. Add your domain
3. Update DNS records

## Support

For deployment issues, check:
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com/)
- [Vite Docs](https://vitejs.dev/guide/ssr.html#deploying)
