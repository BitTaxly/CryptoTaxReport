import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getUserWalletSets,
  saveUserWalletSet,
  deleteUserWalletSet,
} from '@/lib/userStore';

/**
 * GET /api/wallet-sets
 * Get all wallet sets for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const walletSets = await getUserWalletSets(userId);

    return NextResponse.json({
      success: true,
      data: walletSets,
    });
  } catch (error) {
    console.error('Error fetching wallet sets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallet sets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wallet-sets
 * Save a new wallet set for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { setName, wallets } = await request.json();

    if (!setName || !wallets || !Array.isArray(wallets)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;
    const success = await saveUserWalletSet(userId, setName, wallets);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to save wallet set' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Wallet set saved successfully',
    });
  } catch (error) {
    console.error('Error saving wallet set:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save wallet set' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/wallet-sets
 * Delete a wallet set for the authenticated user
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { setName } = await request.json();

    if (!setName) {
      return NextResponse.json(
        { success: false, error: 'Set name is required' },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;
    const success = await deleteUserWalletSet(userId, setName);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete wallet set' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Wallet set deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting wallet set:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete wallet set' },
      { status: 500 }
    );
  }
}
