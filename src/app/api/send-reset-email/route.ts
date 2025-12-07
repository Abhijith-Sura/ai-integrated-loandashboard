import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, resetLink } = await req.json();

    if (!email || !resetLink) {
      return NextResponse.json({ error: 'Email and reset link are required' }, { status: 400 });
    }

    const result = await resend.emails.send({
      from: 'ClickPe <onboarding@resend.dev>',
      to: email,
      subject: '🔐 Reset your ClickPe password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="color: #666;">You requested a password reset for your ClickPe account.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p style="color: #666;">Or copy this link:</p>
          <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px; font-size: 12px;">
            ${resetLink}
          </p>

          <p style="color: #999; font-size: 12px;">
            <strong>⏰ Link expires in 15 minutes</strong>
          </p>

          <p style="color: #999; font-size: 12px;">
            If you didn't request this, please ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2025 ClickPe Loan Picks. All rights reserved.
          </p>
        </div>
      `,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Email error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
