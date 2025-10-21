import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    // Update email verification status in your database
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
