import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // 1. Fetch all existing products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*');

    if (fetchError) throw fetchError;
    if (!products || products.length === 0) {
      return NextResponse.json({ message: "No products found to update." });
    }

    // 2. Apply micro-fluctuations
    const updatedProducts = products.map((product) => {
      // Random fluctuation between -0.25% and +0.25%
      const fluctuation = (Math.random() * 0.5) - 0.25;
      
      // Calculate new rate and ensure it doesn't drop below 5% or go above 35%
      let newRate = parseFloat(product.interest_rate) + fluctuation;
      newRate = Math.max(5.0, Math.min(newRate, 35.0));
      
      return {
        ...product,
        interest_rate: parseFloat(newRate.toFixed(2)) // Keep 2 decimal places
      };
    });

    // 3. Bulk update (upsert based on id)
    const { error: upsertError } = await supabase
      .from('products')
      .upsert(updatedProducts);

    if (upsertError) throw upsertError;

    return NextResponse.json({
      success: true,
      message: `Successfully simulated market fluctuations for ${updatedProducts.length} loan products.`,
      sample_changes: updatedProducts.slice(0, 3).map(p => ({
        bank: p.bank_name,
        loan: p.loan_type,
        new_rate: p.interest_rate
      }))
    });

  } catch (error: any) {
    console.error('Market Simulation Error:', error);
    return NextResponse.json(
      { error: 'Failed to simulate market', details: error.message },
      { status: 500 }
    );
  }
}
