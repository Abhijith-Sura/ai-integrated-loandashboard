import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, productData, history } = body;

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
      ...history.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
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

    return NextResponse.json({
      answer: data.choices[0].message.content,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ answer: `Error: ${error.message}` }, { status: 500 });
  }
}
