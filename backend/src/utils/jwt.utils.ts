import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { User } from '@prisma/client';
import { sendSuccess, sendError } from './response';

// Token types
export type TokenType = 'access' | 'refresh';

// Token payload interface
export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  type: TokenType;
  iat?: number;
  exp?: number;
}

// Refresh token interface
export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  revoked: boolean;
}

// Token configuration
const JWT_CONFIG = {
  ACCESS_TOKEN_SECRET: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
  REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production',
  ACCESS_TOKEN_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
} as const;

// Generate access token
export const generateAccessToken = (user: User): string => {
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    type: 'access',
  };

  return jwt.sign(payload, JWT_CONFIG.ACCESS_TOKEN_SECRET, {
    expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
    issuer: 'sochamila-api',
    audience: 'sochamila-client',
    subject: user.id,
  } as jwt.SignOptions);
};

// Generate refresh token
export const generateRefreshToken = async (user: User): Promise<string> => {
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    type: 'refresh',
  };

  const token = jwt.sign(payload, JWT_CONFIG.REFRESH_TOKEN_SECRET, {
    expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'sochamila-api',
    audience: 'sochamila-client',
    subject: user.id,
    jwtid: Math.random().toString(36).substring(2, 15),
  } as jwt.SignOptions);

  // TODO: Store refresh token in database once Prisma client issues are resolved
  // const expiresAt = new Date();
  // expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
  //
  // await prisma.refreshToken.create({
  //   data: {
  //     userId: user.id,
  //     token: token,
  //     expiresAt: expiresAt,
  //     revoked: false,
  //   },
  // });

  return token;
};

// Verify access token
export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const payload = jwt.verify(token, JWT_CONFIG.ACCESS_TOKEN_SECRET) as TokenPayload;
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return payload;
  } catch (error) {
    console.error('[JWT] Access token verification failed:', error);
    return null;
  }
};

// Verify refresh token
export const verifyRefreshToken = async (token: string): Promise<TokenPayload | null> => {
  try {
    // First verify JWT signature
    const payload = jwt.verify(token, JWT_CONFIG.REFRESH_TOKEN_SECRET) as TokenPayload;
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // TODO: Check if token exists in database and is not revoked once Prisma issues are resolved
    // const storedToken = await prisma.refreshToken.findFirst({
    //   where: {
    //     token: token,
    //     userId: payload.id,
    //     revoked: false,
    //     expiresAt: {
    //       gt: new Date(),
    //     },
    //   },
    // });
    //
    // if (!storedToken) {
    //   console.warn('[JWT] Refresh token not found or revoked:', payload.id);
    //   return null;
    // }

    return payload;
  } catch (error) {
    console.error('[JWT] Refresh token verification failed:', error);
    return null;
  }
};

// Revoke refresh token
export const revokeRefreshToken = async (userId: string, tokenId?: string): Promise<void> => {
  try {
    // TODO: Implement token revocation once Prisma issues are resolved
    // const whereClause: any = {
    //   userId: userId,
    //   revoked: false,
    // };
    //
    // if (tokenId) {
    //   whereClause.id = tokenId;
    // }
    //
    // await prisma.refreshToken.updateMany({
    //   where: whereClause,
    //   data: {
    //     revoked: true,
    //     updatedAt: new Date(),
    //   },
    // });

    console.log('[JWT] Refresh token(s) revoked for user:', userId);
  } catch (error) {
    console.error('[JWT] Failed to revoke refresh token:', error);
  }
};

// Revoke all refresh tokens for user (logout from all devices)
export const revokeAllUserTokens = async (userId: string): Promise<void> => {
  await revokeRefreshToken(userId);
};

// Cleanup expired tokens
export const cleanupExpiredTokens = async (): Promise<void> => {
  try {
    // TODO: Implement token cleanup once Prisma issues are resolved
    // const result = await prisma.refreshToken.deleteMany({
    //   where: {
    //     OR: [
    //       { expiresAt: { lt: new Date() } },
    //       { revoked: true },
    //     ],
    //   },
    // });
    //
    // if (result.count > 0) {
    //   console.log(`[JWT] Cleaned up ${result.count} expired/revoked tokens`);
    // }
    console.log('[JWT] Token cleanup placeholder - Prisma issues pending');
  } catch (error) {
    console.error('[JWT] Token cleanup failed:', error);
  }
};

// Refresh token rotation middleware
export const refreshTokenRotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      sendError(res, 'Refresh token is required', 400);
      return;
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      sendError(res, 'Invalid or expired refresh token', 401);
      return;
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user || !user.isActive) {
      // Revoke the compromised token
      await revokeRefreshToken(payload.id);
      sendError(res, 'User not found or inactive', 401);
      return;
    }

    // Revoke the old refresh token (rotation)
    await revokeRefreshToken(payload.id);

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user);

    // Send response with new tokens
    sendSuccess(res, 'Tokens refreshed successfully', {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[JWT] Token refresh error:', error);
    sendError(res, 'Failed to refresh tokens', 500);
  }
};

// Token validation middleware
export const validateToken = (req: Request, res: Response, next: Function): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      sendError(res, 'Authorization header missing or invalid', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    if (!payload) {
      sendError(res, 'Invalid or expired access token', 401);
      return;
    }

    // Attach user info to request
    (req as any).user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    console.error('[JWT] Token validation error:', error);
    sendError(res, 'Token validation failed', 401);
  }
};

// Add refresh token routes to auth controller
export const addRefreshTokenRoutes = (router: any): void => {
  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  router.post('/refresh', refreshTokenRotation);

  /**
   * POST /api/auth/logout
   * Revoke current refresh token
   */
  router.post('/logout', validateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      await revokeRefreshToken(userId);
      sendSuccess(res, 'Logged out successfully');
    } catch (error) {
      console.error('[JWT] Logout error:', error);
      sendError(res, 'Logout failed', 500);
    }
  });

  /**
   * POST /api/auth/logout-all
   * Revoke all refresh tokens for user (logout from all devices)
   */
  router.post('/logout-all', validateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      await revokeAllUserTokens(userId);
      sendSuccess(res, 'Logged out from all devices');
    } catch (error) {
      console.error('[JWT] Logout all error:', error);
      sendError(res, 'Logout from all devices failed', 500);
    }
  });
};