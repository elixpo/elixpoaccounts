# Rate Limiting Implementation Guide

## Overview

Your project now has **database-backed rate limiting** that stores login attempts in D1. This provides:

- **Persistence**: Rate limit data persists across server restarts and multiple instances
- **Accuracy**: Centralized tracking across all instances in a distributed system
- **Blocking**: Automatic blocking of IPs that exceed limits
- **Cleanup**: Automatic cleanup of expired entries

## Schema

A new migration (`0002_rate_limits.sql`) creates the `rate_limits` table:

```sql
CREATE TABLE rate_limits (
  id TEXT PRIMARY KEY,
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,           -- 'login', 'register', 'password_reset'
  attempt_count INTEGER DEFAULT 1,
  first_attempt_at DATETIME,
  last_attempt_at DATETIME,
  window_reset_at DATETIME NOT NULL,
  is_blocked BOOLEAN DEFAULT 0,
  blocked_until DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ip_address, endpoint)
);
```

## Rate Limiting Configuration

Three endpoints have rate limiting configured:

### Login Endpoint
- **Limit**: 10 attempts per minute
- **Block Duration**: 15 minutes
- **Location**: `/app/api/auth/login/route.ts`

### Register Endpoint
- **Limit**: 5 attempts per minute  
- **Block Duration**: 30 minutes
- **Location**: `/app/api/auth/register/route.ts`

### Password Reset Endpoint
- **Limit**: 3 attempts per hour
- **Block Duration**: 1 hour
- **Location**: `/app/api/auth/forgot-password/route.ts`

## Implementation

### Files Created/Modified

1. **`src/workers/migrations/0002_rate_limits.sql`** - New migration with rate_limits table
2. **`src/lib/rate-limit.ts`** - Core rate limiting logic with database integration
3. **`src/lib/rate-limit-middleware.ts`** - Helper functions for API routes

### Using the Rate Limiter in API Routes

```typescript
import { checkLoginRateLimit } from '@/lib/rate-limit-middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('cf-connecting-ip') || 
                      'unknown';

    // Get D1 database from environment (needs to be implemented)
    // const db = env.DB;

    // Check rate limit
    // const rateLimit = await checkLoginRateLimit(db, ipAddress);
    
    // if (!rateLimit.allowed) {
    //   return NextResponse.json(
    //     { 
    //       error: 'Too many login attempts. Please try again later.',
    //       retryAfter: rateLimit.retryAfter 
    //     },
    //     { 
    //       status: 429,
    //       headers: { 'Retry-After': (rateLimit.retryAfter || 60).toString() }
    //     }
    //   );
    // }

    // ... rest of endpoint logic
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

## Database Operations

The `DatabaseRateLimiter` class handles:

1. **Checking if IP is blocked** - Queries for active blocks
2. **Getting or creating entries** - Creates new entries or resets expired ones
3. **Incrementing counters** - Tracks attempts within the window
4. **Setting blocks** - Blocks IPs that exceed limits
5. **Cleanup** - Removes expired entries

### RateLimitResult Interface

```typescript
interface RateLimitResult {
  allowed: boolean;          // Whether the request is allowed
  remaining: number;         // Remaining attempts in current window
  resetAt: number;          // Timestamp when window resets (milliseconds)
  retryAfter?: number;      // Seconds until retry is allowed (for blocked IPs)
}
```

## Environment Setup

To enable rate limiting in your API routes, you need to:

1. **Integrate D1 Database**: Pass the D1 database instance to your routes
2. **Uncomment Rate Limit Checks**: Enable the rate limit checks in your route handlers
3. **Deploy Migrations**: Run `0002_rate_limits.sql` against your D1 database

## Production Considerations

### 1. Extracting Real IP Address
Always use the correct header to extract client IP:

```typescript
const ipAddress = 
  request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
  request.headers.get('cf-connecting-ip') ||
  'unknown';
```

**For Cloudflare Workers**, use `cf-connecting-ip` header.

### 2. Database Indexes
The migration includes indexes on:
- `(ip_address, endpoint)` - For lookups
- `window_reset_at` - For cleanup queries
- `is_blocked` - For active blocks
- `blocked_until` - For expiry tracking

### 3. Error Handling
The rate limiter **fails open** - if the database check fails, the request is allowed. This prevents legitimate users from being locked out if the database is temporarily unavailable.

### 4. Cleanup Strategy
Consider periodic cleanup of expired entries:

```typescript
// Run periodically (e.g., every hour)
const limiter = createLoginRateLimiter();
await limiter.cleanup(db);
```

## Testing

To test rate limiting:

```bash
# Make 11 login requests to the same endpoint from the same IP
# The 11th request should be blocked with 429 status

for i in {1..11}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: 192.168.1.1" \
    -d '{"email":"test@example.com","password":"test","provider":"email"}'
  sleep 1
done
```

## Future Enhancements

1. **Distributed Rate Limiting** - Use Cloudflare KV for cross-datacenter rate limiting
2. **Adaptive Rate Limiting** - Adjust limits based on attack patterns
3. **Whitelist/Blacklist** - Allow/deny specific IPs
4. **Metrics & Monitoring** - Track rate limit violations by endpoint
5. **User-Based Rate Limiting** - Rate limit by user ID in addition to IP

## Troubleshooting

### Issue: Rate limit not working
- Ensure `0002_rate_limits.sql` migration has been applied to D1
- Check that D1 database instance is being passed to the rate limiter
- Verify IP extraction logic is correct for your deployment environment

### Issue: Getting blocked too easily
- Adjust `maxRequests` and `blockDurationMs` in the rate limiter config
- Check if IP extraction is grouping multiple users under one IP (e.g., corporate proxy)

### Issue: Cleanup not happening
- Run manual cleanup: `await limiter.cleanup(db)` in a scheduled job
- Consider setting up a Cloudflare Worker or cron job for periodic cleanup
