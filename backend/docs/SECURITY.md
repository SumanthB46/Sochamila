# Security Guidelines

## Environment Variables Management

### Critical Security Notice
Never commit `.env` files to version control. The `.env` file contains sensitive credentials and API keys.

### Setup Instructions
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update all placeholder values with your actual credentials

3. Generate secure JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### Required Environment Variables

#### Database
- `DATABASE_URL`: PostgreSQL connection string

#### Authentication
- `JWT_SECRET`: Strong random string for JWT signing (32+ characters)
- `ADMIN_EMAIL`: Admin user email
- `ADMIN_PASSWORD`: Secure admin password

#### External Services
- `IMAGEKIT_PUBLIC_KEY`: ImageKit public key
- `IMAGEKIT_PRIVATE_KEY`: ImageKit private key
- `IMAGEKIT_URL_ENDPOINT`: ImageKit endpoint
- `REPLICATE_API_TOKEN`: Replicate API token for AI features
- `OPENAI_API_KEY`: OpenAI API key for AI features

#### Payment Processing
- `CASHFREE_CLIENT_ID`: Cashfree API client ID
- `CASHFREE_CLIENT_SECRET`: Cashfree API client secret
- `CASHFREE_ENVIRONMENT`: TEST or PROD

## Security Best Practices

### 1. Password Requirements
- Minimum 12 characters
- Must contain uppercase, lowercase, numbers, and special characters
- Use password hashing (bcrypt) with salt rounds >= 12

### 2. Rate Limiting
- Implement rate limiting on authentication endpoints
- Default: 100 requests per 15 minutes per IP
- Stricter limits for login attempts (5 per hour)

### 3. JWT Security
- Use short-lived access tokens (15-30 minutes)
- Implement refresh token rotation
- Store refresh tokens securely (HttpOnly cookies)
- Validate token expiration and signature

### 4. Input Validation
- Validate all user inputs using Zod schemas
- Sanitize user data before database storage
- Implement proper error handling without information leakage

### 5. CORS Configuration
- Restrict origins to known domains only
- Use credentials only when necessary
- Validate preflight requests

### 6. Database Security
- Use parameterized queries to prevent SQL injection
- Implement proper database user permissions
- Regular database backups
- Connection pooling with proper limits

### 7. API Security
- Implement proper authentication middleware
- Use role-based access control (RBAC)
- Validate user permissions for each request
- Implement request size limits
- Add request timeouts

### 8. Frontend Security
- Implement proper CSRF protection
- Use secure headers (Content Security Policy)
- Validate user sessions on client-side
- Implement proper error boundaries
- Sanitize user-generated content

### 9. Monitoring & Logging
- Log all authentication attempts
- Monitor for suspicious activities
- Implement audit trails for sensitive operations
- Use structured logging for better analysis
- Set up security alerts for unusual patterns

### 10. Deployment Security
- Use HTTPS in production
- Implement proper SSL/TLS configuration
- Regular security updates and patches
- Security scanning of dependencies
- Penetration testing before major releases

## Compliance Considerations

### Data Protection
- Implement data encryption at rest and in transit
- Follow data retention policies
- Implement proper data deletion procedures
- Comply with applicable privacy regulations (GDPR, CCPA, etc.)

### Audit Requirements
- Maintain audit logs for security events
- Regular security assessments
- Third-party security reviews
- Incident response procedures

## Emergency Procedures

### Security Incident Response
1. Isolate affected systems
2. Preserve evidence for forensic analysis
3. Notify appropriate stakeholders
4. Implement temporary security measures
5. Conduct post-incident review and improvements

### Key Rotation
- Regular JWT secret rotation
- Database credential rotation
- API key rotation for external services
- Admin password changes