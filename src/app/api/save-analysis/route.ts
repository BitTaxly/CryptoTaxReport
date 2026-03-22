import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { TaxReport } from '@/types';

export const maxDuration = 60;

/**
 * POST /api/save-analysis
 * Saves analysis results to user's history
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, wallets, reportData } = body;

    if (!userId || !wallets || !reportData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to analysis_history table
    const { data, error } = await supabase
      .from('analysis_history')
      .insert({
        user_id: userId,
        wallets: wallets,
        report_data: reportData,
        report_date: reportData.reportDate,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving analysis:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save analysis' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('Error in save-analysis:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/save-analysis?userId=xxx
 * Gets user's analysis history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching analysis history:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch analysis history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Error in get analysis history:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/save-analysis?id=xxx
 * Deletes an analysis record
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('analysis_history')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting analysis:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete analysis' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Analysis deleted successfully',
    });
  } catch (error) {
    console.error('Error in delete analysis:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
