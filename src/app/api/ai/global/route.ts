import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const globalChatSchema = z.object({
  message: z.string().min(1).max(1000),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = globalChatSchema.parse(body);
    const { message, history } = validated;

    const systemPrompt = `You are the "FinTech Enterprise Assistant", a highly capable, professional AI embedded in the FinTech financial dashboard.
Your goal is to help users navigate the platform, explain features, and provide basic financial advice.

PLATFORM CAPABILITIES & NAVIGATION (ALWAYS USE THESE MARKDOWN LINKS WHEN RELEVANT):
1. User Dashboard: For viewing their personal active loans, applying for new ones, or running the AI risk assessment. [Go to Dashboard](/dashboard)
2. Loan Products: For browsing all available loan products in the market, filtering by bank, APR, or tenure. [View Products](/products)
3. Management Console: An enterprise/admin view for monitoring the global portfolio value, tracking defaults, and exporting CSV/PDF reports. [Open Management Console](/management)
4. Authentication: To log in or create an account. [Login/Signup](/login)

INSTRUCTIONS:
1. Be concise, extremely professional, and helpful.
2. If a user asks what they can do here, explain the platform's 3 main areas (Dashboard, Products, Management).
3. If a user asks to perform an action (e.g., "I want to see all loans", "How do I manage the portfolio?"), you MUST provide the clickable markdown link to the respective page.
4. CRITICAL: If a user asks how to apply for a loan, instruct them to browse the [Loan Products](/products) page, open a specific loan's chat, and ask to apply there to be securely redirected to the bank's official portal. NEVER tell them to go to the login page to apply for a loan.
5. If a user asks you to calculate something generic (like 50000 * 0.1), do the math for them accurately.
6. Format your responses using clean Markdown (bolding, lists).`;

    const messages = [
      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq error:', data);
      return NextResponse.json({ answer: 'Error processing request.' }, { status: 500 });
    }

    const answer = data.choices[0].message.content;

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error('Global Chat Error:', error);
    return NextResponse.json({ answer: 'Error processing request.' }, { status: 500 });
  }
}
