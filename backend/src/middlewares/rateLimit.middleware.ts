import { rateLimit } from 'express-rate-limit';
import { Request, Response } from 'express';

// General API rate limiter
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP, please try again later.',
  },
  // Skip logging for rate limit errors to avoid log spam
  skipFailedRequests: true,
  skipSuccessfulRequests: false,
});

// Strict rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts, please try again later.',
  },
  // Use default key generator (IP-based) to avoid IPv6 issues
  // keyGenerator: (req: Request) => {
  //   const userAgent = req.headers['user-agent'] || 'unknown';
  //   return `${req.ip}-${userAgent}`;
  // },
});

// Login-specific rate limiter (even stricter)
export const loginRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3, // Only 3 login attempts per hour per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many login attempts. Please try again in 1 hour.',
  },
  // Uses in-memory store by default (for production, consider Redis)
});

// Registration rate limiter
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 2, // Only 2 registration attempts per hour per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Registration limit exceeded. Please try again in 1 hour.',
  },
});

// Password reset rate limiter
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3, // Only 3 password reset attempts per hour per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Password reset limit exceeded. Please try again in 1 hour.',
  },
});

// API endpoint specific rate limiters
export const apiRateLimiters = {
  // Product endpoints - moderate rate limiting
  products: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 200, // 200 requests per 15 minutes
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      success: false,
      statusCode: 429,
      message: 'Too many product requests. Please try again later.',
    },
  }),

  // Order endpoints - stricter rate limiting
  orders: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 50, // 50 requests per 15 minutes
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      success: false,
      statusCode: 429,
      message: 'Too many order requests. Please try again later.',
    },
  }),

  // Admin endpoints - very strict rate limiting
  admin: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // 100 requests per 15 minutes
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      success: false,
      statusCode: 429,
      message: 'Too many admin requests. Please try again later.',
    },
  }),
};

// Custom rate limiter for specific needs
export const createCustomRateLimiter = (options: {
  windowMs: number;
  limit: number;
  message?: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      success: false,
      statusCode: 429,
      message: options.message || 'Rate limit exceeded',
    },
  });
};

// Middleware to log rate limit events
export const rateLimitLogger = (req: Request, res: Response, next: Function) => {
  // Add rate limit info to request for logging
  (req as any).rateLimitInfo = {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString(),
  };
  
  // Log rate limit events
  res.on('finish', () => {
    if (res.statusCode === 429) {
      console.warn('[RATE_LIMIT] Request blocked', {
        ip: req.ip,
        method: req.method,
        url: req.originalUrl,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString(),
      });
    }
  });
  
  next();
};