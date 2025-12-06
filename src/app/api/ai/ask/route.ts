import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const chatRequestSchema = z.object({
  productId: z.string().uuid(),
  message: z.string().min(1).max(500),
  userId: z.string().uuid().optional(),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
  productData: z.object({
    name: z.string(),
    bank: z.string(),
    rate_apr: z.number(),
    min_income: z.number(),
    min_credit_score: z.number(),
    tenure_min_months: z.number(),
    tenure_max_months: z.number(),
    processing_fee_pct: z.number(),
    prepayment_allowed: z.boolean(),
    disbursal_speed: z.string(),
    docs_level: z.string(),
    summary: z.string(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = chatRequestSchema.parse(body);
    const { message, productData, history, productId, userId } = validated;

    const systemPrompt = `You are a helpful AI assistant for ClickPe Loan Picks. Answer questions ONLY about this loan product:
Product: ${productData.name}
Bank: ${productData.bank}
APR: ${productData.rate_apr}%
Min Income: ₹${(productData.min_income / 100000).toFixed(1)}L
Credit Score: ${productData.min_credit_score}+
Tenure: ${productData.tenure_min_months}-${productData.tenure_max_months} months
Processing Fee: ${productData.processing_fee_pct}%
Prepayment: ${productData.prepayment_allowed ? 'Yes' : 'No'}
Disbursal: ${productData.disbursal_speed}

If asked about other products, say "I can only answer about ${productData.name}". Be concise.`;

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
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq error:', data);
      return NextResponse.json({ answer: `Error: ${data.error?.message || 'API error'}` }, { status: 500 });
    }

    const answer = data.choices[0].message.content;

    if (userId) {
      await supabase.from('ai_chat_messages').insert({
        user_id: userId,
        product_id: productId,
        role: 'user',
        content: message,
      });

      await supabase.from('ai_chat_messages').insert({
        user_id: userId,
        product_id: productId,
        role: 'assistant',
        content: answer,
      });
    }

    return NextResponse.json({ answer });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request format', details: error.issues }, { status: 400 });
    }
    console.error('Error:', error);
    return NextResponse.json({ answer: `Error: ${error.message}` }, { status: 500 });
  }
}
