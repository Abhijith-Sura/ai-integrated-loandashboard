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
  const [aiRecommendations, setAiRecommendations] = useState(''); // ← CHANGED: string instead of array
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

  // ← FIXED FUNCTION
  const getRecommendations = async () => {
    if (!income || !creditScore || !loanAmount) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    setAiRecommendations(''); // Clear previous
    try {
      const response = await fetch('/api/ai/recommend', {  // ← FIXED PATH
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: parseFloat(income),
          creditScore: parseInt(creditScore),
          loanAmount: parseFloat(loanAmount),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendations');
      }

      setAiRecommendations(data.recommendations); // ← Set text recommendations
      
    } catch (error: any) {
      console.error('Error:', error);
      alert('Failed to get recommendations: ' + (error.message || 'Unknown error'));
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
              <h1 className="text-3xl font-bold text-gray-900">AI-Integrated Loan Dashboard</h1>
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

        {/* ← NEW: Display AI Recommendations */}
        {aiRecommendations && (
          <Card className="mb-8 border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
              <CardTitle className="flex items-center text-purple-900">
                <Sparkles className="w-6 h-6 mr-2" />
                ✨ Your AI-Powered Loan Recommendations
              </CardTitle>
              <CardDescription>
                Personalized suggestions based on your financial profile
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="whitespace-pre-wrap text-gray-800 bg-white p-6 rounded-lg shadow-inner border">
                {aiRecommendations}
              </div>
              <div className="mt-6 flex gap-4">
                <Button onClick={() => router.push('/products')} className="flex-1">
                  Browse All Products →
                </Button>
                <Button 
                  onClick={() => setAiRecommendations('')} 
                  variant="outline"
                  className="flex-1"
                >
                  Clear Recommendations
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
