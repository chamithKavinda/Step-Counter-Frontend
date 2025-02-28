import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Environment variables should be properly set up in your project
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email?: string;
  role?: string;
  [key: string]: any; // For any additional claims
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generate a JWT access token
 * @param payload - User data to encode in the token
 * @returns The generated JWT token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    jwtid: uuidv4(),
  });
};

/**
 * Generate a refresh token
 * @param payload - User data to encode in the token
 * @returns The generated refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    jwtid: uuidv4(),
  });
};

/**
 * Generate both access and refresh tokens
 * @param payload - User data to encode in the tokens
 * @returns Object containing both tokens and expiration time
 */
export const generateTokens = (payload: TokenPayload): TokenResponse => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  // Calculate expiration time in seconds
  const expiresIn = typeof JWT_EXPIRES_IN === 'string' 
    ? parseInt(JWT_EXPIRES_IN) * (JWT_EXPIRES_IN.includes('h') ? 3600 : JWT_EXPIRES_IN.includes('d') ? 86400 : 1)
    : JWT_EXPIRES_IN;

  return {
    accessToken,
    refreshToken,
    expiresIn
  };
};

/**
 * Verify a token and return the decoded payload
 * @param token - JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null if not found
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

/**
 * Refresh an expired access token using a valid refresh token
 * @param refreshToken - Valid refresh token
 * @returns New token response or null if refresh token is invalid
 */
export const refreshAccessToken = (refreshToken: string): TokenResponse | null => {
  const decoded = verifyToken(refreshToken);
  
  if (!decoded) {
    return null;
  }
  
  // Generate new tokens
  return generateTokens({
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role
  });
};