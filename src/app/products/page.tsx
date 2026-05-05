'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MessageCircle, Filter } from 'lucide-react';
import { ChatSheet } from '@/components/ChatSheet';
import { Header } from '@/components/Header';

interface Loan {
  id: number;
  bank_name: string;
  loan_type: string;
  interest_rate: number;
  max_amount: number;
  min_income: number;
  min_credit_score: number;
  processing_fee: number;
  tenure_months: number;
  features: string[];
  badge?: string;
  product_type?: string;
  rate_apr?: number;
  tenure_min_months?: number;
  tenure_max_months?: number;
  processing_fee_pct?: number;
  prepayment_allowed?: boolean;
  disbursal_speed?: string;
  summary?: string;
}

export default function ProductsPage() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Loan | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const router = useRouter();

  // Filter states
  const [bankSearch, setBankSearch] = useState('');
  const [minApr, setMinApr] = useState('');
  const [maxApr, setMaxApr] = useState('');
  const [minIncome, setMinIncome] = useState('');
  const [minCredit, setMinCredit] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      fetchAllLoans();
    }
  }, [mounted, router]);

  const fetchAllLoans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (data.products && Array.isArray(data.products)) {
        setLoans(data.products);
        setFilteredLoans(data.products);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...loans];

    if (bankSearch) {
      filtered = filtered.filter(loan => 
        loan.bank_name.toLowerCase().includes(bankSearch.toLowerCase())
      );
    }

    if (minApr) {
      filtered = filtered.filter(loan => 
        (loan.interest_rate || loan.rate_apr || 0) >= parseFloat(minApr)
      );
    }

    if (maxApr) {
      filtered = filtered.filter(loan => 
        (loan.interest_rate || loan.rate_apr || 0) <= parseFloat(maxApr)
      );
    }

    if (minIncome) {
      filtered = filtered.filter(loan => 
        loan.min_income >= parseFloat(minIncome)
      );
    }

    if (minCredit) {
      filtered = filtered.filter(loan => 
        loan.min_credit_score >= parseInt(minCredit)
      );
    }

    setFilteredLoans(filtered);
  };

  const resetFilters = () => {
    setBankSearch('');
    setMinApr('');
    setMaxApr('');
    setMinIncome('');
    setMinCredit('');
    setFilteredLoans(loans);
  };

  const openChat = (loan: Loan) => {
    setSelectedProduct(loan);
    setChatOpen(true);
  };

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-slate-900 dark:text-slate-100 transition-colors duration-150 relative overflow-hidden">
      
      {/* Background Image & Overlays */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="fixed inset-0 z-0 bg-white/75 dark:bg-slate-950/85 pointer-events-none transition-colors duration-150" />
      
      <Header />
      
      <div className="relative z-10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-150">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Loan Products</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Browse and filter all available loan options</p>
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border-slate-200/80 dark:border-slate-800/80 shadow-lg transition-colors duration-150">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-medium">
              <Filter className="w-5 h-5 mr-2" />
              Market Ledger
            </CardTitle>
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
                  value={minCredit}
                  onChange={(e) => setMinCredit(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={applyFilters}>Apply Filters</Button>
              <Button onClick={resetFilters} variant="outline">Reset</Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-slate-600 dark:text-slate-400">
              Showing {filteredLoans.length} of {loans.length} loan products
            </div>

            {filteredLoans.length === 0 ? (
              <Card className="p-12 text-center bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border-slate-200/80 dark:border-slate-800/80 shadow-lg">
                <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">No products match your filters</p>
                <Button onClick={resetFilters}>Clear Filters</Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLoans.map((loan) => (
                  <Card key={loan.id} className="hover:shadow-xl dark:hover:shadow-blue-900/20 transition-all bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border-slate-200/80 dark:border-slate-800/80 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        {loan.badge && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-medium text-xs rounded-full">{loan.badge}</Badge>
                        )}
                        <div className="text-right ml-auto">
                          <div className="text-2xl font-medium text-slate-900 dark:text-white">
                            {loan.interest_rate || loan.rate_apr}%
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">APR</div>
                        </div>
                      </div>
                      <CardTitle className="text-lg font-medium text-slate-900 dark:text-white mb-1">{loan.loan_type || loan.product_type}</CardTitle>
                      <CardDescription className="text-slate-500 dark:text-slate-400">{loan.bank_name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">Max Amount</div>
                          <div className="font-semibold text-slate-900 dark:text-slate-200">₹{(loan.max_amount / 100000).toFixed(0)}L</div>
                        </div>
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">Credit Score</div>
                          <div className="font-semibold text-slate-900 dark:text-slate-200">{loan.min_credit_score}+</div>
                        </div>
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">Min Income</div>
                          <div className="font-semibold text-slate-900 dark:text-slate-200">₹{(loan.min_income / 100000).toFixed(1)}L</div>
                        </div>
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">Tenure</div>
                          <div className="font-semibold text-slate-900 dark:text-slate-200">{loan.tenure_months}m</div>
                        </div>
                      </div>

                      {loan.features && loan.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {loan.features.slice(0, 3).map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-950/50">{feature}</Badge>
                          ))}
                        </div>
                      )}

                      <Button 
                        variant="outline" 
                        className="w-full border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50/90 dark:hover:bg-slate-800/90 shadow-sm transition-colors"
                        onClick={() => openChat(loan)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Ask About This Product
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Chat Sheet */}
      {selectedProduct && (
        <ChatSheet
          open={chatOpen}
          onOpenChange={setChatOpen}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
