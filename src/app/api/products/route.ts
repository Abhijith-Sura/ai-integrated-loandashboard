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
  limit: z.string().optional(),
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
      limit: searchParams.get('limit') || undefined,
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
      supabaseQuery = supabaseQuery.lte('min_income', parseFloat(query.minIncome));
    }
    if (query.minCreditScore) {
      supabaseQuery = supabaseQuery.lte('min_credit_score', parseInt(query.minCreditScore));
    }

    // Apply limit if provided
    if (query.limit) {
      supabaseQuery = supabaseQuery.limit(parseInt(query.limit));
    }

    const { data, error } = await supabaseQuery;

    if (error) throw error;

    // Transform data to match frontend interface
    const transformedData = data?.map((item: any) => ({
      id: item.id,
      bank_name: item.bank || item.bank_name,
      loan_type: item.product_type || item.loan_type || 'Personal Loan',
      interest_rate: item.rate_apr || item.interest_rate || 0,
      max_amount: item.max_amount || 0,
      min_income: item.min_income || 0,
      min_credit_score: item.min_credit_score || 0,
      processing_fee: item.processing_fee || 0,
      tenure_months: item.tenure_months || 12,
      features: item.features || [],
      badge: item.badge || null,
    })) || [];

    return NextResponse.json({ 
      products: transformedData,
      success: true 
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid query parameters', 
        details: error.issues 
      }, { status: 400 });
    }
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch products' 
    }, { status: 500 });
  }
}