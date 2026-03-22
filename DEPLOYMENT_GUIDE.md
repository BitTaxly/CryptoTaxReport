# Deployment Guide

Step-by-step guide to deploy the Crypto Tax Reporter to production.

## Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

### Prerequisites

- GitHub/GitLab account
- Vercel account (free tier available)
- API keys ready

### Steps

1. **Push Code to Git**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

2. **Deploy to Vercel**

Visit [vercel.com](https://vercel.com) and:

- Click "Import Project"
- Select your repository
- Configure project:
  - Framework Preset: Next.js
  - Root Directory: ./
  - Build Command: `npm run build`
  - Output Directory: .next

3. **Add Environment Variables**

In Vercel dashboard → Settings → Environment Variables:

```
ETHEREUM_RPC_ENDPOINT=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
ALCHEMY_API_KEY=your_alchemy_key
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
COINGECKO_API_KEY=your_key_here
```

4. **Deploy**

- Click "Deploy"
- Wait 2-3 minutes
- Your app is live!

### Custom Domain

1. Go to Vercel → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. SSL automatically configured

## Option 2: Railway

Railway offers simple deployment with built-in databases.

### Steps

1. **Install Railway CLI**

```bash
npm install -g @railway/cli
railway login
```

2. **Initialize Project**

```bash
railway init
railway link
```

3. **Add Environment Variables**

```bash
railway variables set ETHEREUM_RPC_ENDPOINT=your_endpoint
railway variables set ALCHEMY_API_KEY=your_key
railway variables set COINGECKO_API_KEY=your_key
```

4. **Deploy**

```bash
railway up
```

5. **Get URL**

```bash
railway domain
```

### Add Redis (Optional)

```bash
railway add redis
# Automatically sets REDIS_URL
```

## Option 3: AWS (Advanced)

For full control and scalability.

### Architecture

- **Frontend/API**: AWS Amplify or ECS
- **CDN**: CloudFront
- **Cache**: ElastiCache (Redis)
- **Secrets**: AWS Secrets Manager

### Steps

1. **Build Docker Image**

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

Update `next.config.js`:
```javascript
module.exports = {
  output: 'standalone',
  // ... rest of config
}
```

2. **Build and Push to ECR**

```bash
# Build
docker build -t crypto-tax-reporter .

# Tag
docker tag crypto-tax-reporter:latest YOUR_ECR_URL/crypto-tax-reporter:latest

# Push
docker push YOUR_ECR_URL/crypto-tax-reporter:latest
```

3. **Deploy to ECS**

- Create ECS cluster
- Create task definition
- Create service
- Configure load balancer

4. **Setup CloudFront**

- Create distribution
- Point to load balancer
- Configure SSL certificate

## Option 4: Google Cloud Run

Serverless container deployment.

### Steps

1. **Create `cloudbuild.yaml`**

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/crypto-tax-reporter', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/crypto-tax-reporter']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'crypto-tax-reporter'
      - '--image'
      - 'gcr.io/$PROJECT_ID/crypto-tax-reporter'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
```

2. **Deploy**

```bash
gcloud builds submit --config cloudbuild.yaml
```

3. **Set Environment Variables**

```bash
gcloud run services update crypto-tax-reporter \
  --set-env-vars="ETHEREUM_RPC_ENDPOINT=...,ALCHEMY_API_KEY=..."
```

## Option 5: DigitalOcean App Platform

Simple and affordable.

### Steps

1. **Create App**

- Go to DigitalOcean → Apps → Create App
- Connect GitHub repository
- Select repository

2. **Configure**

```yaml
name: crypto-tax-reporter
services:
  - name: web
    github:
      repo: your-username/crypto-tax-reporter
      branch: main
    build_command: npm run build
    run_command: npm start
    envs:
      - key: ETHEREUM_RPC_ENDPOINT
        value: your_endpoint
      - key: ALCHEMY_API_KEY
        value: your_key
```

3. **Deploy**

- Click "Create Resources"
- Wait for deployment

## Post-Deployment Tasks

### 1. Verify Deployment

Test all endpoints:

```bash
# Health check (if implemented)
curl https://your-domain.com/api/health

# Analyze wallets
curl -X POST https://your-domain.com/api/analyze-wallets \
  -H "Content-Type: application/json" \
  -d '{"addresses":["WALLET_ADDRESS"],"date":"2023-12-31"}'
```

### 2. Monitor Performance

- Check response times
- Monitor error rates
- Review API usage
- Check quota limits

### 3. Configure Alerts

Set up alerts for:
- High error rates
- Slow response times
- API quota warnings
- Downtime

### 4. Setup Analytics

Add analytics to track:
- User engagement
- Report generation success
- Popular features
- Error patterns

### 5. Document Deployment

Create internal docs:
- Deployment date
- Version deployed
- Configuration used
- Known issues
- Rollback procedure

## Rollback Procedure

### Vercel

```bash
# Via CLI
vercel rollback
```

Or via dashboard → Deployments → Previous deployment → Promote to Production

### Railway

```bash
railway rollback
```

### Docker/Kubernetes

```bash
# Rollback to previous version
kubectl rollout undo deployment/crypto-tax-reporter

# Or specific revision
kubectl rollout undo deployment/crypto-tax-reporter --to-revision=2
```

## Monitoring Checklist

After deployment, monitor:

- [ ] Application is accessible
- [ ] All API endpoints working
- [ ] Report generation successful
- [ ] Environment variables loaded
- [ ] External APIs responding
- [ ] No console errors
- [ ] SSL certificate valid
- [ ] Domain configured correctly
- [ ] Analytics tracking
- [ ] Error tracking active

## Common Deployment Issues

### Issue: Build Fails

**Solution**:
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Issue: Environment Variables Not Loaded

**Solution**:
- Check variable names match exactly
- Ensure variables are set for production environment
- Restart application after setting variables

### Issue: API Timeouts

**Solution**:
- Increase timeout in platform settings
- Add `maxDuration` to API routes:
```typescript
export const maxDuration = 60; // 60 seconds
```

### Issue: Out of Memory

**Solution**:
- Increase memory allocation in platform settings
- Optimize batch sizes
- Implement streaming for large responses

## Scaling Strategy

### Vertical Scaling

Increase resources as needed:
- Memory: 512MB → 1GB → 2GB
- CPU: 0.5 vCPU → 1 vCPU → 2 vCPU

### Horizontal Scaling

Add more instances:
- Auto-scaling based on CPU/memory
- Load balancing across instances
- Stateless design (already implemented)

### Cost Estimates

**Vercel (Hobby/Pro)**:
- Hobby: Free (limited)
- Pro: $20/month

**Railway**:
- ~$5-20/month depending on usage

**AWS**:
- ECS: ~$30-100/month
- CloudFront: ~$1-10/month
- ElastiCache: ~$15-50/month

**Google Cloud Run**:
- Pay per request
- Typically $5-30/month for moderate traffic

## Security Post-Deployment

1. **Run Security Scan**

```bash
npm audit
npm audit fix
```

2. **Check SSL**

Visit [SSL Labs](https://www.ssllabs.com/ssltest/) to test SSL configuration

3. **Test CORS**

Ensure only allowed origins can access API

4. **Review Logs**

Check for:
- Unauthorized access attempts
- Unusual traffic patterns
- Error spikes

## Maintenance Schedule

### Daily
- Check error rates
- Monitor uptime
- Review critical alerts

### Weekly
- Review API usage
- Check costs
- Update documentation

### Monthly
- Update dependencies
- Security audit
- Performance review
- Cost optimization

### Quarterly
- Major updates
- Architecture review
- Security penetration test
- Disaster recovery drill

## Support

For deployment help:

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **AWS**: [aws.amazon.com/support](https://aws.amazon.com/support)
- **Google Cloud**: [cloud.google.com/support](https://cloud.google.com/support)

## Next Steps

After successful deployment:

1. Announce launch
2. Gather user feedback
3. Monitor usage patterns
4. Plan feature updates
5. Optimize based on data

## Conclusion

Choose deployment platform based on:
- **Simplicity**: Vercel or Railway
- **Cost**: Railway or DigitalOcean
- **Control**: AWS or Google Cloud
- **Scalability**: AWS or Google Cloud

Start with Vercel for ease, migrate to AWS/GCP if needed later.
