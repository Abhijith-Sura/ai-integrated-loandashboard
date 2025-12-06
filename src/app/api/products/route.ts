import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Zod schema for query validation
const productQuerySchema = z.object({
  bank: z.string().optional(),
  minApr: z.string().optional(),
  maxApr: z.string().optional(),
  minIncome: z.string().optional(),
  minCreditScore: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    
    // Validate query params with Zod
    const query = productQuerySchema.parse({
      bank: searchParams.get('bank') || undefined,
      minApr: searchParams.get('minApr') || undefined,
      maxApr: searchParams.get('maxApr') || undefined,
      minIncome: searchParams.get('minIncome') || undefined,
      minCreditScore: searchParams.get('minCreditScore') || undefined,
    });

    // Build Supabase query
    let supabaseQuery = supabase.from('products').select('*');

    // Apply filters
    if (query.bank) {
      supabaseQuery = supabaseQuery.ilike('bank', `%${query.bank}%`);
    }
    if (query.minApr) {
      supabaseQuery = supabaseQuery.gte('rate_apr', parseFloat(query.minApr));
    }
    if (query.maxApr) {
      supabaseQuery = supabaseQuery.lte('rate_apr', parseFloat(query.maxApr));
    }
    if (query.minIncome) {
      supabaseQuery = supabaseQuery.gte('min_income', parseFloat(query.minIncome));
    }
    if (query.minCreditScore) {
      supabaseQuery = supabaseQuery.gte('min_credit_score', parseInt(query.minCreditScore));
    }

    const { data, error } = await supabaseQuery;

    if (error) throw error;

    return NextResponse.json({ products: data });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
    return NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
}
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
