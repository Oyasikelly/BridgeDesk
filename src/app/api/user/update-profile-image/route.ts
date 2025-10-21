import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId, imageUrl } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (imageUrl === undefined) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Update user profile image in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profileImageUrl: imageUrl,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        profileImageUrl: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      profileImage: updatedUser.profileImageUrl,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profile image update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile image' },
      { status: 500 }
    );
  }
}
