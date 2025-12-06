'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Shield, Zap, LogOut, MessageCircle } from 'lucide-react';
import { ChatSheet } from '@/components/ChatSheet';

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

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Loan | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem('auth_token');
    const name = localStorage.getItem('user_name');

    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      setUserName(name || 'User');
      fetchTopLoans();
    }
  }, [mounted, router]);

  const fetchTopLoans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products?limit=5');
      const data = await response.json();
      
      if (data.products && Array.isArray(data.products)) {
        setLoans(data.products);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    router.push('/login');
  };

  const openChat = (loan: Loan) => {
    setSelectedProduct(loan);
    setChatOpen(true);
  };

  const getBadgeIcon = (badge?: string) => {
    switch (badge?.toLowerCase()) {
      case 'best match':
        return <Sparkles className="w-3 h-3" />;
      case 'lowest apr':
        return <TrendingUp className="w-3 h-3" />;
      case 'fastest approval':
        return <Zap className="w-3 h-3" />;
      default:
        return <Shield className="w-3 h-3" />;
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Loan Picks Dashboard</h1>
            <p className="text-sm text-gray-600">Discover personalized loan products tailored for you</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading loans...</p>
          </div>
        ) : loans.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No loan products available</p>
            <Button onClick={() => router.push('/products')}>Browse All Products</Button>
          </Card>
        ) : (
          <>
            {/* Best Match Hero Card */}
            {loans[0] && (
              <Card className="mb-8 border-2 border-purple-500 shadow-lg bg-gradient-to-br from-purple-50 to-white">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-purple-600">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Best Match
                    </Badge>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600">{loans[0].interest_rate || loans[0].rate_apr}%</div>
                      <div className="text-sm text-gray-600">APR</div>
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{loans[0].loan_type || loans[0].product_type}</CardTitle>
                  <CardDescription className="text-base">{loans[0].bank_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    {loans[0].summary || `Quick personal loans up to ₹${(loans[0].max_amount / 100000).toFixed(0)} lakhs with minimal documentation`}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Min Income</div>
                      <div className="font-semibold">₹{(loans[0].min_income / 100000).toFixed(1)}L</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Credit Score</div>
                      <div className="font-semibold">{loans[0].min_credit_score}+</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Tenure</div>
                      <div className="font-semibold">{loans[0].tenure_min_months || 6}-{loans[0].tenure_max_months || loans[0].tenure_months} months</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Processing Fee</div>
                      <div className="font-semibold">{loans[0].processing_fee || loans[0].processing_fee_pct}%</div>
                    </div>
                  </div>

                  {loans[0].features && loans[0].features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {loans[0].features.map((feature, idx) => (
                        <Badge key={idx} variant="outline">{feature}</Badge>
                      ))}
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    className="w-full mb-2"
                    onClick={() => openChat(loans[0])}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Ask About This Product
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Other Loans */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Top 5 Matches</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {loans.slice(1).map((loan) => (
                <Card key={loan.id} className="hover:shadow-lg transition-shadow border-2 border-purple-200">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      {loan.badge && (
                        <Badge variant="default" className="bg-purple-600">
                          {getBadgeIcon(loan.badge)}
                          <span className="ml-1">{loan.badge}</span>
                        </Badge>
                      )}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{loan.interest_rate || loan.rate_apr}%</div>
                        <div className="text-xs text-gray-600">APR</div>
                      </div>
                    </div>
                    <CardTitle>{loan.loan_type || loan.product_type}</CardTitle>
                    <CardDescription>{loan.bank_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div>
                        <div className="text-gray-600">Min Income</div>
                        <div className="font-semibold">₹{(loan.min_income / 100000).toFixed(1)}L</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Credit Score</div>
                        <div className="font-semibold">{loan.min_credit_score}+</div>
                      </div>
                    </div>
                    {loan.features && loan.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {loan.features.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{feature}</Badge>
                        ))}
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => openChat(loan)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Ask About This Product
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button onClick={() => router.push('/products')} size="lg">
                View All Products
              </Button>
            </div>
          </>
        )}
      </main>

      {/* Product-Specific Chat */}
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