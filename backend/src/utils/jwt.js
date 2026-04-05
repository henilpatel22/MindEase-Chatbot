/**
 * MindEase — JWT Utility
 * Sign and verify access + refresh tokens.
 */

const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_fallback_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_fallback_secret';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '1h';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate an access token (short-lived)
 * @param {string} userId - MongoDB user ID
 * @param {string} role - 'user' | 'admin'
 */
const signAccessToken = (userId, role) =>
  jwt.sign({ id: userId, role }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });

/**
 * Generate a refresh token (long-lived, stored in HttpOnly cookie)
 */
const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

/**
 * Verify access token, throw if invalid/expired.
 */
const verifyAccessToken = (token) => jwt.verify(token, ACCESS_SECRET);

/**
 * Verify refresh token.
 */
const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
