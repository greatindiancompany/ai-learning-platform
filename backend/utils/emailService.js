// ============================================================================
// Email Service (using Resend.com)
// ============================================================================
// Handles all email sending operations using Resend's email API
// ============================================================================

import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://inspir.uk';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@inspir.uk';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Initialize Resend client
const resend = new Resend(RESEND_API_KEY);

// ============================================================================
// Email Templates
// ============================================================================

const generateEmailVerificationHTML = (verificationToken) => {
    const verificationUrl = `${FRONTEND_URL}/verify-email/${verificationToken}`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - inspir</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #7C3AED 0%, #0030AB 100%); min-height: 100vh;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #7C3AED 0%, #0030AB 100%); padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 24px; padding: 40px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 30px;">
                            <h1 style="font-size: 48px; font-weight: 900; margin: 0; background: linear-gradient(135deg, #7C3AED, #0030AB, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                                inspir
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="color: #1F2937; font-size: 16px; line-height: 1.6;">
                            <h2 style="font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 16px;">
                                Welcome to inspir! 🎉
                            </h2>
                            <p style="margin-bottom: 20px;">
                                Thanks for signing up! We're excited to have you join thousands of students already using inspir to supercharge their learning.
                            </p>
                            <p style="margin-bottom: 30px;">
                                Please verify your email address to activate your 14-day free trial and start creating student profiles.
                            </p>

                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #0030AB); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin-top: 30px; font-size: 14px; color: #6B7280;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="word-break: break-all; color: #7C3AED; font-size: 14px;">
                                ${verificationUrl}
                            </p>

                            <p style="margin-top: 30px; font-size: 14px; color: #9CA3AF;">
                                If you didn't create an account with inspir, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding-top: 40px; border-top: 1px solid #E5E7EB; margin-top: 40px;">
                            <p style="text-align: center; color: #9CA3AF; font-size: 12px; margin: 0;">
                                © 2024 inspir. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

const generatePasswordResetHTML = (resetToken) => {
    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - inspir</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #7C3AED 0%, #0030AB 100%); min-height: 100vh;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #7C3AED 0%, #0030AB 100%); padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 24px; padding: 40px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 30px;">
                            <h1 style="font-size: 48px; font-weight: 900; margin: 0; background: linear-gradient(135deg, #7C3AED, #0030AB, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                                inspir
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="color: #1F2937; font-size: 16px; line-height: 1.6;">
                            <h2 style="font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 16px;">
                                Reset Your Password
                            </h2>
                            <p style="margin-bottom: 20px;">
                                We received a request to reset your password for your inspir account.
                            </p>
                            <p style="margin-bottom: 30px;">
                                Click the button below to choose a new password. This link will expire in 1 hour.
                            </p>

                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #0030AB); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin-top: 30px; font-size: 14px; color: #6B7280;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="word-break: break-all; color: #7C3AED; font-size: 14px;">
                                ${resetUrl}
                            </p>

                            <p style="margin-top: 30px; font-size: 14px; color: #9CA3AF;">
                                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding-top: 40px; border-top: 1px solid #E5E7EB; margin-top: 40px;">
                            <p style="text-align: center; color: #9CA3AF; font-size: 12px; margin: 0;">
                                © 2024 inspir. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

// ============================================================================
// Email Sending Functions
// ============================================================================

/**
 * Send email verification
 * @param {string} email - Recipient email address
 * @param {string} verificationToken - Email verification token
 */
export const sendVerificationEmail = async (email, verificationToken) => {
    try {
        const htmlContent = generateEmailVerificationHTML(verificationToken);
        const verificationUrl = `${FRONTEND_URL}/verify-email/${verificationToken}`;

        // Send email using Resend
        const { data, error } = await resend.emails.send({
            from: `inspir <${EMAIL_FROM}>`,
            to: email,
            subject: 'Verify your inspir account',
            html: htmlContent
        });

        if (error) {
            console.error('Resend error:', error);
            throw error;
        }

        console.log('✅ Verification email sent successfully to:', email);
        console.log('📧 Email ID:', data?.id);
        console.log('🔗 Verification URL:', verificationUrl);

        return { success: true, emailId: data?.id };
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetToken - Password reset token
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        const htmlContent = generatePasswordResetHTML(resetToken);
        const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

        // Send email using Resend
        const { data, error } = await resend.emails.send({
            from: `inspir <${EMAIL_FROM}>`,
            to: email,
            subject: 'Reset your inspir password',
            html: htmlContent
        });

        if (error) {
            console.error('Resend error:', error);
            throw error;
        }

        console.log('✅ Password reset email sent successfully to:', email);
        console.log('📧 Email ID:', data?.id);
        console.log('🔗 Reset URL:', resetUrl);

        return { success: true, emailId: data?.id };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};

/**
 * Send welcome email (after email verification)
 * @param {string} email - Recipient email address
 * @param {string} accountType - Type of account (parent, school, organization, company)
 */
export const sendWelcomeEmail = async (email, accountType) => {
    try {
        const { data, error } = await resend.emails.send({
            from: `inspir <${EMAIL_FROM}>`,
            to: email,
            subject: 'Welcome to inspir! 🎉',
            html: `
                <h1>Welcome to inspir!</h1>
                <p>Your ${accountType} account has been verified and activated.</p>
                <p>Start creating student profiles and experience the future of AI-powered learning.</p>
            `
        });

        if (error) {
            console.error('Resend error:', error);
            throw error;
        }

        console.log('✅ Welcome email sent successfully to:', email);
        return { success: true, emailId: data?.id };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw error;
    }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail
};
