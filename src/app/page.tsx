'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@supabase/supabase-js';
import { ChatSheet } from '@/components/ChatSheet';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Product {
  id: string;
  name: string;
  bank: string;
  type: string;
  rate_apr: number;
  min_income: number;
  min_credit_score: number;
  tenure_min_months: number;
  tenure_max_months: number;
  processing_fee_pct: number;
  prepayment_allowed: boolean;
  disbursal_speed: string;
  docs_level: string;
  summary: string;
  faq: any[];
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').limit(5);
    setProducts(data || []);
    setLoading(false);
  };

  const getBadges = (product: Product): string[] => {
    const badges: string[] = [];
    if (product.rate_apr < 8) badges.push('Low APR');
    if (product.disbursal_speed === 'fast') badges.push('Fast Disbursal');
    if (product.prepayment_allowed) badges.push('No Prepayment');
    if (product.docs_level === 'minimal') badges.push('Low Docs');
    if (product.processing_fee_pct === 0) badges.push('Zero Fee');
    return badges.slice(0, 3);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Loan Picks Dashboard</h1>
          <p className="text-slate-600">Discover personalized loan products tailored for you</p>
        </div>

        {products.length > 0 && (
          <div className="mb-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl blur-xl opacity-20"></div>
              <Card className="relative border-2 border-blue-500 bg-white shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-2 bg-blue-600">🏆 Best Match</Badge>
                      <CardTitle className="text-2xl">{products[0].name}</CardTitle>
                      <CardDescription>{products[0].bank}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">{products[0].rate_apr}%</div>
                      <div className="text-sm text-slate-600">APR</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-slate-700 mb-6">{products[0].summary}</p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-slate-600">Min Income</p>
                      <p className="font-semibold text-slate-900">₹{(products[0].min_income / 100000).toFixed(1)}L</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Credit Score</p>
                      <p className="font-semibold text-slate-900">{products[0].min_credit_score}+</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Tenure</p>
                      <p className="font-semibold text-slate-900">{products[0].tenure_min_months}-{products[0].tenure_max_months} months</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Processing Fee</p>
                      <p className="font-semibold text-slate-900">{products[0].processing_fee_pct}%</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {getBadges(products[0]).map((badge) => (
                      <Badge key={badge} variant="secondary">{badge}</Badge>
                    ))}
                  </div>
                  <ChatSheet product={products[0]} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Top 5 Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {products.map((product, idx) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  {idx === 0 && <Badge className="mb-2 w-fit bg-blue-600">Best</Badge>}
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.bank}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">APR</p>
                    <p className="text-2xl font-bold text-slate-900">{product.rate_apr}%</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-slate-600">Min Income</p>
                      <p className="font-semibold">₹{(product.min_income / 100000).toFixed(1)}L</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Credit</p>
                      <p className="font-semibold">{product.min_credit_score}+</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getBadges(product).map((badge) => (
                      <Badge key={badge} variant="outline" className="text-xs">{badge}</Badge>
                    ))}
                  </div>
                  <ChatSheet product={product} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
