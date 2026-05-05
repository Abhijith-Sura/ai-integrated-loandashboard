import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const chatRequestSchema = z.object({
  productId: z.string(),
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
    max_amount: z.number(),
    rate_apr: z.number(),
    calculated_emi_for_max_amount: z.number(),
    min_income: z.number(),
    min_credit_score: z.number(),
    tenure_min_months: z.number(),
    tenure_max_months: z.number(),
    processing_fee_pct: z.number(),
    prepayment_allowed: z.boolean(),
    disbursal_speed: z.string(),
    docs_level: z.string(),
    summary: z.string(),
    apply_link: z.string(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = chatRequestSchema.parse(body);
    const { message, productData, history, productId, userId } = validated;

    const systemPrompt = `You are a highly capable "Financial Advisor AI" for FinTech Enterprise. Answer questions ONLY about this loan product:
Product: ${productData.name}
Bank: ${productData.bank}
Max Amount: ₹${(productData.max_amount / 100000).toFixed(1)}L
APR: ${productData.rate_apr}%
Calculated EMI for Max Amount (${productData.tenure_max_months} months): ₹${productData.calculated_emi_for_max_amount}/month
Min Income: ₹${(productData.min_income / 100000).toFixed(1)}L
Credit Score: ${productData.min_credit_score}+
Tenure: ${productData.tenure_min_months}-${productData.tenure_max_months} months
Processing Fee: ${productData.processing_fee_pct}%
Prepayment: ${productData.prepayment_allowed ? 'Yes' : 'No'}
Disbursal: ${productData.disbursal_speed}
Application Link: ${productData.apply_link}

INSTRUCTIONS:
1. If the user asks for estimations (e.g., "What is my EMI?"), confidently use the Calculated EMI above or perform simple proportional math if they ask for half the amount.
2. CRITICAL: If the user asks where or how to apply for this specific loan, you MUST ONLY provide the exact Application Link above as a clickable markdown link. NEVER suggest applying internally via a dashboard or login page. Example: "**[Apply directly at ${productData.bank}](${productData.apply_link})**".
3. Provide clickable markdown links for general navigation ONLY if they ask about other platform features: "[View all products](/products)" or "[Dashboard](/dashboard)".
4. Format your responses using clean Markdown (bolding, bullet points) to make it easy to read.
5. If asked about entirely unrelated topics, briefly guide them back to this loan or offer to check the [Dashboard](/dashboard).`;

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
