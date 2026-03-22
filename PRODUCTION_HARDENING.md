# Production Hardening Guide

This document outlines recommendations for deploying the Crypto Tax Reporter application in a production environment.

## Security

### 1. API Key Management

**Current State**: API keys in environment variables
**Recommendations**:

```bash
# Use secret management services
- Vercel: Environment Variables (encrypted)
- AWS: Secrets Manager
- Google Cloud: Secret Manager
- HashiCorp Vault
```

**Implementation**:
```typescript
// Example: Use runtime config instead of process.env
import { getSecret } from '@/lib/secrets';

const apiKey = await getSecret('ALCHEMY_API_KEY');
```

### 2. Rate Limiting

**Add request rate limiting to prevent abuse:**

```bash
npm install express-rate-limit
```

Create `/src/middleware/rateLimit.ts`:
```typescript
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many requests, please try again later',
});
```

### 3. Input Sanitization

**Already implemented**: Zod validation
**Additional**:

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize user inputs
const sanitized = DOMPurify.sanitize(userInput);
```

### 4. CORS Configuration

Add `/src/middleware/cors.ts`:
```typescript
export const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST'],
  credentials: true,
};
```

### 5. Security Headers

Update `next.config.js`:
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

## Performance

### 1. Caching Strategy

**Add Redis for price caching:**

```bash
npm install ioredis
```

Create `/src/lib/redis.ts`:
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const cachePrice = async (
  key: string,
  price: number,
  ttl: number = 3600
) => {
  await redis.setex(key, ttl, JSON.stringify(price));
};

export const getCachedPrice = async (key: string) => {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
};
```

Update `pricingService.ts`:
```typescript
import { getCachedPrice, cachePrice } from '@/lib/redis';

export const fetchTokenPrice = async (...) => {
  const cacheKey = `price:${tokenAddress}:${date}`;

  // Check cache first
  const cached = await getCachedPrice(cacheKey);
  if (cached) return cached;

  // Fetch and cache
  const price = await fetchFromAPI(...);
  await cachePrice(cacheKey, price);

  return price;
};
```

### 2. Database for User Reports (Optional)

**Store generated reports for users:**

```bash
npm install @prisma/client
npx prisma init
```

Schema (`prisma/schema.prisma`):
```prisma
model Report {
  id          String   @id @default(cuid())
  wallets     Json
  reportDate  DateTime
  grandTotal  Float
  createdAt   DateTime @default(now())
  expiresAt   DateTime
}
```

### 3. Background Job Queue

**For processing large wallet sets:**

```bash
npm install bull
```

Create `/src/lib/queue.ts`:
```typescript
import Queue from 'bull';

export const reportQueue = new Queue('report-generation', {
  redis: process.env.REDIS_URL,
});

reportQueue.process(async (job) => {
  const { addresses, date } = job.data;
  // Process report
  return reportData;
});
```

### 4. CDN Configuration

**Serve static assets via CDN:**

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.yourdomain.com'],
  },
  assetPrefix: process.env.NODE_ENV === 'production'
    ? 'https://cdn.yourdomain.com'
    : '',
};
```

## Monitoring

### 1. Error Tracking with Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

Update API routes:
```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // Your code
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

### 2. Logging

Create `/src/lib/logger.ts`:
```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});
```

### 3. Health Check Endpoint

Create `/src/app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  };

  // Check external dependencies
  try {
    // Test database connection
    // Test Redis connection
    // Test API endpoints
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { ...health, status: 'error', error: error.message },
      { status: 503 }
    );
  }
}
```

### 4. Analytics

```typescript
// Google Analytics
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
```

## Scalability

### 1. Horizontal Scaling

**Deploy multiple instances:**

- Use load balancer (Vercel, AWS ALB, Cloudflare)
- Stateless API design (already implemented)
- Shared cache (Redis)

### 2. API Request Batching

**Optimize external API calls:**

```typescript
// Batch CoinGecko requests
export const batchPriceRequests = async (tokens: string[]) => {
  // CoinGecko supports up to 250 IDs per request
  const batches = chunkArray(tokens, 250);

  const results = await Promise.all(
    batches.map(batch =>
      fetch(`/simple/price?ids=${batch.join(',')}&vs_currencies=usd`)
    )
  );

  return results.flat();
};
```

### 3. Database Indexing

If using database:
```sql
CREATE INDEX idx_report_date ON reports(report_date);
CREATE INDEX idx_created_at ON reports(created_at);
CREATE INDEX idx_wallet_address ON report_wallets(wallet_address);
```

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Security headers enabled
- [ ] Rate limiting implemented
- [ ] Error tracking configured
- [ ] Logging configured
- [ ] Health check endpoint working
- [ ] API keys secured
- [ ] CORS configured

### Post-Deployment

- [ ] SSL/HTTPS enabled
- [ ] Domain configured
- [ ] CDN configured
- [ ] Monitoring dashboards set up
- [ ] Alerts configured
- [ ] Backup strategy defined
- [ ] Disaster recovery plan
- [ ] Load testing completed

## Environment-Specific Configurations

### Development
```env
NODE_ENV=development
LOG_LEVEL=debug
RATE_LIMIT_ENABLED=false
```

### Staging
```env
NODE_ENV=staging
LOG_LEVEL=info
RATE_LIMIT_ENABLED=true
SENTRY_ENVIRONMENT=staging
```

### Production
```env
NODE_ENV=production
LOG_LEVEL=warn
RATE_LIMIT_ENABLED=true
SENTRY_ENVIRONMENT=production
ENABLE_ANALYTICS=true
```

## Cost Optimization

### 1. API Usage Monitoring

Track API calls to optimize costs:

```typescript
// Track API usage
const trackAPIUsage = async (provider: string, endpoint: string) => {
  await prisma.apiUsage.create({
    data: { provider, endpoint, timestamp: new Date() }
  });
};
```

### 2. Caching Strategy

- Cache historical prices (never change)
- Cache blockchain metadata
- Use CDN for static assets

### 3. Rate Limit External APIs

```typescript
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1200, // 50 requests/minute
});

export const fetchPrice = limiter.wrap(originalFetchPrice);
```

## Maintenance

### Regular Tasks

- **Daily**: Monitor error rates
- **Weekly**: Review API usage and costs
- **Monthly**: Update dependencies
- **Quarterly**: Security audit

### Dependency Updates

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Security audit
npm audit
npm audit fix
```

### Backup Strategy

- Database backups (if applicable)
- Environment variable backups
- Configuration backups
- Export logs regularly

## Compliance

### Data Privacy

- No personal data collected by default
- Wallet addresses are public information
- No data retention (stateless by default)

### Tax Disclaimer

Add to UI:
```
This tool is for informational purposes only.
Consult a tax professional for tax advice.
Historical data may not be 100% accurate.
```

## Support

### User Support

- FAQ section
- Error messages guide
- Contact form
- Status page

### Developer Support

- API documentation
- Error codes documentation
- Troubleshooting guide
- Architecture documentation

## Emergency Procedures

### High Load

1. Enable caching aggressively
2. Reduce API batch sizes
3. Increase timeout limits
4. Scale horizontally

### API Provider Outage

1. Switch to backup provider
2. Use cached data
3. Display user notification
4. Queue requests for retry

### Security Incident

1. Rotate API keys
2. Review access logs
3. Notify users if needed
4. Document incident
5. Update security measures

## Recommended Tools

- **Hosting**: Vercel, Railway, Render
- **Database**: PostgreSQL (Supabase, Railway)
- **Cache**: Redis (Upstash, Railway)
- **Monitoring**: Sentry, DataDog
- **Analytics**: PostHog, Plausible
- **Status Page**: StatusPage.io
- **CDN**: Cloudflare, Vercel Edge

## Testing in Production

### Gradual Rollout

1. Deploy to staging
2. Run smoke tests
3. Deploy to 10% of users
4. Monitor metrics
5. Gradual increase to 100%

### Monitoring Metrics

- Response times
- Error rates
- API quota usage
- User satisfaction
- Report generation success rate

## Conclusion

This guide provides a comprehensive approach to hardening the application for production use. Implement based on your specific requirements and scale.

Priority order:
1. Security (headers, rate limiting, input validation)
2. Error tracking and logging
3. Performance (caching, CDN)
4. Monitoring and alerting
5. Scalability improvements
