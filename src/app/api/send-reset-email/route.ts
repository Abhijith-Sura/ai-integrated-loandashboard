import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Use Supabase's built-in password reset
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.headers.get('origin') || 'http://localhost:3000'}/reset-password`,
    });

    if (error) {
      console.error('Supabase reset error:', error);
      throw error;
    }

    console.log('✅ Password reset email sent via Supabase to:', email);

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset email sent successfully. Check your inbox!' 
    });
  } catch (error: any) {
    console.error('Reset error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to send reset email' 
    }, { status: 500 });
  }
}
