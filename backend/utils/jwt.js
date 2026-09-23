// ============================================================================
// JWT Token Utilities
// ============================================================================
// Handles JWT token generation, verification, and management
// Used for both student and parent authentication
// ============================================================================

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// JWT Configuration
const JWT_SECRET_PLACEHOLDER = 'your-super-secret-jwt-key-change-this-in-production';
const JWT_SECRET = process.env.JWT_SECRET || JWT_SECRET_PLACEHOLDER;

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === JWT_SECRET_PLACEHOLDER)) {
    throw new Error('JWT_SECRET must be set to a unique value when NODE_ENV is production');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Generate JWT token for student authentication
 * @param {Object} student - Student account object
 * @param {string} student.id - Student UUID
 * @param {string} student.username - Student username
 * @param {string} student.parent_id - Parent UUID
 * @returns {string} JWT token
 */
export const generateStudentToken = (student) => {
    const payload = {
        student_id: student.id,
        username: student.username,
        parent_id: student.parent_id,
        account_type: 'student',
        iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

/**
 * Generate JWT token for parent authentication
 * @param {Object} parent - Parent account object
 * @param {string} parent.id - Parent UUID
 * @param {string} parent.email - Parent email
 * @param {string} parent.account_type - Account type (parent, school, organization, company)
 * @returns {string} JWT token
 */
export const generateParentToken = (parent) => {
    const payload = {
        parent_id: parent.id,
        email: parent.email,
        account_type: parent.account_type || 'parent',
        subscription_status: parent.subscription_status,
        iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

/**
 * Generate refresh token (longer expiry)
 * @param {string} userId - User UUID
 * @param {string} accountType - 'student' or 'parent'
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (userId, accountType) => {
    const payload = {
        user_id: userId,
        account_type: accountType,
        token_type: 'refresh',
        iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '7d' // Refresh tokens last 7 days
    });
};

// ============================================================================
// Token Verification
// ============================================================================

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        // Token is invalid, expired, or malformed
        if (error.name === 'TokenExpiredError') {
            console.log('Token expired:', error.message);
        } else if (error.name === 'JsonWebTokenError') {
            console.log('Invalid token:', error.message);
        }
        return null;
    }
};

/**
 * Verify student token and extract student data
 * @param {string} token - JWT token
 * @returns {Object|null} Student data or null if invalid
 */
export const verifyStudentToken = (token) => {
    const decoded = verifyToken(token);

    if (!decoded) {
        return null;
    }

    // Verify this is a student token
    if (decoded.account_type !== 'student' || !decoded.student_id) {
        console.log('Token is not a valid student token');
        return null;
    }

    return {
        student_id: decoded.student_id,
        username: decoded.username,
        parent_id: decoded.parent_id,
        account_type: decoded.account_type
    };
};

/**
 * Verify parent token and extract parent data
 * @param {string} token - JWT token
 * @returns {Object|null} Parent data or null if invalid
 */
export const verifyParentToken = (token) => {
    const decoded = verifyToken(token);

    if (!decoded) {
        return null;
    }

    // Verify this is a parent token
    if (!decoded.parent_id || !['parent', 'school', 'organization', 'company'].includes(decoded.account_type)) {
        console.log('Token is not a valid parent token');
        return null;
    }

    return {
        parent_id: decoded.parent_id,
        email: decoded.email,
        account_type: decoded.account_type,
        subscription_status: decoded.subscription_status
    };
};

// ============================================================================
// Token Extraction
// ============================================================================

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null if not found
 */
export const extractTokenFromHeader = (authHeader) => {
    if (!authHeader) {
        return null;
    }

    // Expected format: "Bearer <token>"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        console.log('Invalid Authorization header format');
        return null;
    }

    return parts[1];
};

/**
 * Extract token from request object
 * Checks Authorization header and optionally cookies
 * @param {Object} req - Express request object
 * @returns {string|null} Token or null if not found
 */
export const extractTokenFromRequest = (req) => {
    // Check Authorization header first
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = extractTokenFromHeader(authHeader);

    if (token) {
        return token;
    }

    // Fallback: Check cookies if available
    if (req.cookies && req.cookies.auth_token) {
        return req.cookies.auth_token;
    }

    return null;
};

// ============================================================================
// Token Validation Helpers
// ============================================================================

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired, false otherwise
 */
export const isTokenExpired = (token) => {
    try {
        const decoded = jwt.decode(token);

        if (!decoded || !decoded.exp) {
            return true;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date or null if invalid
 */
export const getTokenExpiration = (token) => {
    try {
        const decoded = jwt.decode(token);

        if (!decoded || !decoded.exp) {
            return null;
        }

        return new Date(decoded.exp * 1000);
    } catch (error) {
        return null;
    }
};

/**
 * Get remaining time until token expires
 * @param {string} token - JWT token
 * @returns {number} Milliseconds until expiration, or 0 if expired
 */
export const getTokenTimeRemaining = (token) => {
    const expirationDate = getTokenExpiration(token);

    if (!expirationDate) {
        return 0;
    }

    const now = new Date();
    const remaining = expirationDate.getTime() - now.getTime();

    return remaining > 0 ? remaining : 0;
};

// ============================================================================
// Token Generation for Password Reset & Email Verification
// ============================================================================

/**
 * Generate a secure random token for password reset or email verification
 * @param {number} length - Length of the token (default: 32)
 * @returns {string} Random hex token
 */
export const generateSecureToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate password reset token (stored in database, not JWT)
 * @returns {string} Secure random token
 */
export const generatePasswordResetToken = () => {
    return generateSecureToken(32);
};

/**
 * Generate email verification token (stored in database, not JWT)
 * @returns {string} Secure random token
 */
export const generateEmailVerificationToken = () => {
    return generateSecureToken(32);
};

// ============================================================================
// Exports
// ============================================================================

export default {
    // Token Generation
    generateStudentToken,
    generateParentToken,
    generateRefreshToken,

    // Token Verification
    verifyToken,
    verifyStudentToken,
    verifyParentToken,

    // Token Extraction
    extractTokenFromHeader,
    extractTokenFromRequest,

    // Token Validation
    isTokenExpired,
    getTokenExpiration,
    getTokenTimeRemaining,

    // Secure Tokens
    generateSecureToken,
    generatePasswordResetToken,
    generateEmailVerificationToken
};
