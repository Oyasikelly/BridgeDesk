import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json(
        {
          error: 'Supabase connection failed',
          details: error.message,
          message:
            'Unable to connect to authentication service. Please check your configuration.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Supabase connection successful',
      hasSession: !!data.session,
      user: data.session?.user
        ? {
            id: data.session.user.id,
            email: data.session.user.email,
          }
        : null,
    });
  } catch (error) {
    console.error('Test route error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while testing the connection.',
      },
      { status: 500 }
    );
  }
}
