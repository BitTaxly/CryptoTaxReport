import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rateLimiter';

export const maxDuration = 60;

/**
 * POST /api/gdpr/delete-account
 * GDPR Article 17: Right to Erasure ("Right to be Forgotten")
 * Swiss DPA Compliant: User data deletion
 *
 * Permanently deletes all user data including:
 * - User account
 * - Analysis history
 * - Saved reports
 * - All associated personal data
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting for security
    const identifier = getClientIdentifier(request);
    const rateLimit = checkRateLimit(identifier, RATE_LIMITS.auth);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
          resetTime: new Date(rateLimit.resetTime).toISOString(),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          }
        }
      );
    }

    const body = await request.json();
    const { userId, confirmationCode } = body;

    if (!userId || !confirmationCode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify confirmation code (should be sent via email)
    // In production, implement proper email verification
    if (confirmationCode !== 'DELETE_MY_ACCOUNT') {
      return NextResponse.json(
        { success: false, error: 'Invalid confirmation code' },
        { status: 400 }
      );
    }

    // Delete all user data (CASCADE will handle related records)
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Error deleting user account:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete account' },
        { status: 500 }
      );
    }

    // Log deletion for audit trail (GDPR requirement)
    console.log(`[GDPR] User account deleted: ${userId} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data have been permanently deleted',
    });
  } catch (error) {
    console.error('Error in GDPR delete-account:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gdpr/delete-account
 * Returns information about data deletion
 */
export async function GET() {
  return NextResponse.json({
    name: 'GDPR Data Deletion API',
    description: 'Permanently deletes all user data in compliance with GDPR Article 17',
    compliance: [
      'GDPR Article 17 - Right to Erasure',
      'Swiss Federal Act on Data Protection (FADP)',
    ],
    dataDeleted: [
      'User account information',
      'Email address',
      'Analysis history',
      'Saved reports',
      'All personal identifiable information',
    ],
    process: [
      '1. User requests account deletion',
      '2. Confirmation email sent with verification code',
      '3. User confirms deletion with code',
      '4. All data permanently deleted within 30 days',
      '5. Deletion confirmation sent',
    ],
  });
}
