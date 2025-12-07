'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, TrendingUp, Clock, Shield, Sparkles, LogOut } from 'lucide-react';
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

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [income, setIncome] = useState('');
  const [creditScore, setCreditScore] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [recommendations, setRecommendations] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Loan | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const router = useRouter();

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
      const name = localStorage.getItem('user_name');
      const email = localStorage.getItem('user_email');
      if (name) setUserName(name);
      if (email) setUserEmail(email);
    }
  }, [mounted, router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    router.push('/login');
  };

  const getRecommendations = async () => {
    if (!income || !creditScore || !loanAmount) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: parseFloat(income),
          creditScore: parseInt(creditScore),
          loanAmount: parseFloat(loanAmount),
        }),
      });

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const openChat = (loan: Loan) => {
    setSelectedProduct(loan);
    setChatOpen(true);
  };

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ClickPe Loan Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back, {userName}!</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <TrendingUp className="w-4 h-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">150+</div>
              <p className="text-xs text-gray-600">Loan options available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Best Rate</CardTitle>
              <Sparkles className="w-4 h-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6.5%</div>
              <p className="text-xs text-gray-600">Starting APR</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Quick Approval</CardTitle>
              <Clock className="w-4 h-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24hrs</div>
              <p className="text-xs text-gray-600">Fastest disbursal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Secure</CardTitle>
              <Shield className="w-4 h-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-gray-600">Data protection</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendation Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
              AI-Powered Loan Recommendations
            </CardTitle>
            <CardDescription>
              Get personalized loan suggestions based on your financial profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Annual Income (₹)</label>
                <Input
                  type="number"
                  placeholder="e.g., 500000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Credit Score</label>
                <Input
                  type="number"
                  placeholder="e.g., 750"
                  value={creditScore}
                  onChange={(e) => setCreditScore(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Desired Loan Amount (₹)</label>
                <Input
                  type="number"
                  placeholder="e.g., 1000000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={getRecommendations} disabled={loading} className="w-full md:w-auto">
              {loading ? 'Getting Recommendations...' : 'Get AI Recommendations'}
            </Button>
          </CardContent>
        </Card>

        {/* Browse All Products */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Browse All Products</CardTitle>
            <CardDescription>Explore our complete catalog of loan products</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/products')} variant="outline" className="w-full">
              View All Loan Products →
            </Button>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((loan) => (
                <Card key={loan.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      {loan.badge && (
                        <Badge className="bg-purple-600">{loan.badge}</Badge>
                      )}
                      <div className="text-right ml-auto">
                        <div className="text-2xl font-bold text-gray-900">
                          {loan.interest_rate || loan.rate_apr}%
                        </div>
                        <div className="text-xs text-gray-600">APR</div>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{loan.loan_type || loan.product_type}</CardTitle>
                    <CardDescription>{loan.bank_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div>
                        <div className="text-gray-600">Max Amount</div>
                        <div className="font-semibold">₹{(loan.max_amount / 100000).toFixed(0)}L</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Credit Score</div>
                        <div className="font-semibold">{loan.min_credit_score}+</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Min Income</div>
                        <div className="font-semibold">₹{(loan.min_income / 100000).toFixed(1)}L</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Tenure</div>
                        <div className="font-semibold">{loan.tenure_months}m</div>
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
          </div>
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
