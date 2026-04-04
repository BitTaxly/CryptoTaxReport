import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/gdpr/export-data?userId=xxx
 * GDPR Article 20: Right to Data Portability
 * Swiss DPA Compliant: User data export
 *
 * Exports all user data in machine-readable JSON format
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting for security
    const identifier = getClientIdentifier(request);
    const rateLimit = checkRateLimit(identifier, RATE_LIMITS.api);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch analysis history
    const { data: analysisHistory, error: analysisError } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('user_id', userId);

    // Fetch saved reports
    const { data: savedReports, error: reportsError } = await supabase
      .from('saved_reports')
      .select('*')
      .eq('user_id', userId);

    // Compile all data
    const exportData = {
      exportDate: new Date().toISOString(),
      exportedBy: 'BitTaxly GDPR Data Export',
      compliance: 'GDPR Article 20 - Right to Data Portability',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      analysisHistory: analysisHistory || [],
      savedReports: savedReports || [],
      totalAnalyses: (analysisHistory || []).length,
      totalSavedReports: (savedReports || []).length,
    };

    // Log export for audit trail (GDPR requirement)
    console.log(`[GDPR] Data export for user: ${userId} at ${new Date().toISOString()}`);

    return NextResponse.json(exportData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="bittaxly-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Error in GDPR export-data:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
