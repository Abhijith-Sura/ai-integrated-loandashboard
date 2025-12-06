'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatSheet } from '@/components/ChatSheet';
import Link from 'next/link';

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

export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [bankSearch, setBankSearch] = useState('');
  const [minApr, setMinApr] = useState('');
  const [maxApr, setMaxApr] = useState('');
  const [minIncome, setMinIncome] = useState('');
  const [minCreditScore, setMinCreditScore] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (bankSearch) params.append('bank', bankSearch);
    if (minApr) params.append('minApr', minApr);
    if (maxApr) params.append('maxApr', maxApr);
    if (minIncome) params.append('minIncome', minIncome);
    if (minCreditScore) params.append('minCreditScore', minCreditScore);

    const response = await fetch(`/api/products?${params.toString()}`);
    const data = await response.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFilter = () => {
    fetchProducts();
  };

  const handleReset = () => {
    setBankSearch('');
    setMinApr('');
    setMaxApr('');
    setMinIncome('');
    setMinCreditScore('');
    setTimeout(() => fetchProducts(), 100);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">All Loan Products</h1>
            <p className="text-slate-600">Browse and filter all available loan options</p>
          </div>
          <Link href="/">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Bank Name</label>
                <Input
                  placeholder="Search bank..."
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Min APR (%)</label>
                <Input
                  type="number"
                  placeholder="e.g., 6"
                  value={minApr}
                  onChange={(e) => setMinApr(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Max APR (%)</label>
                <Input
                  type="number"
                  placeholder="e.g., 12"
                  value={maxApr}
                  onChange={(e) => setMaxApr(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Min Income (₹)</label>
                <Input
                  type="number"
                  placeholder="e.g., 250000"
                  value={minIncome}
                  onChange={(e) => setMinIncome(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Min Credit Score</label>
                <Input
                  type="number"
                  placeholder="e.g., 650"
                  value={minCreditScore}
                  onChange={(e) => setMinCreditScore(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleFilter}>Apply Filters</Button>
              <Button onClick={handleReset} variant="outline">Reset</Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : (
          <>
            <div className="mb-4 text-slate-600">
              Showing {products.length} loan product{products.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <CardDescription>{product.bank}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600">APR</p>
                      <p className="text-3xl font-bold text-blue-600">{product.rate_apr}%</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-600">Min Income</p>
                        <p className="font-semibold">₹{(product.min_income / 100000).toFixed(1)}L</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Credit Score</p>
                        <p className="font-semibold">{product.min_credit_score}+</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Tenure</p>
                        <p className="font-semibold">{product.tenure_min_months}-{product.tenure_max_months}m</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Processing Fee</p>
                        <p className="font-semibold">{product.processing_fee_pct}%</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700">{product.summary}</p>

                    <div className="flex flex-wrap gap-1">
                      {getBadges(product).map((badge) => (
                        <Badge key={badge} variant="secondary" className="text-xs">{badge}</Badge>
                      ))}
                    </div>

                    <ChatSheet product={product} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
