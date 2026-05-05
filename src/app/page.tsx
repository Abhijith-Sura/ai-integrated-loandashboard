'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Activity, LineChart, Globe } from 'lucide-react';
import { Header } from '@/components/Header';

interface Loan {
  id: number;
  bank_name: string;
  loan_type: string;
  interest_rate: number;
  max_amount: number;
  rate_apr?: number;
}

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [liveLoans, setLiveLoans] = useState<Loan[]>([]);

  useEffect(() => {
    setMounted(true);
    // Fetch live market data for the public ticker
    const fetchTickerData = async () => {
      try {
        const response = await fetch('/api/products?limit=5');
        const data = await response.json();
        if (data.success) {
          setLiveLoans(data.products);
        }
      } catch (e) {
        console.error("Failed to fetch public ticker", e);
      }
    };
    fetchTickerData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150 relative overflow-hidden">
      
      {/* Background Image & Overlays */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-40"
        style={{
          backgroundImage: "url('/landing-hero-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      
      <Header />

      <main className="relative z-10 flex flex-col items-center justify-center pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-center max-w-6xl mx-auto">
        
        {/* Enterprise Badge */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-10 shadow-[0_0_15px_rgba(37,99,235,0.15)] animate-in fade-in slide-in-from-top-4 duration-700">
          <Activity className="w-4 h-4 mr-2" />
          Enterprise Grade Origination
        </div>

        {/* Hero Section */}
        <h1 className="text-4xl sm:text-5xl lg:text-5xl font-medium tracking-tight text-slate-900 dark:text-white mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Real-Time Loan Federation <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            & AI Risk Assessment
          </span>
        </h1>
        
        <p className="text-lg text-slate-700 dark:text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Access live market data, evaluate risk metrics instantly, and connect with federated banking partners through a single, secure, and zero-collision enterprise portal.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Button 
            onClick={() => router.push('/dashboard')}
            className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-lg font-semibold shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] transition-all duration-300"
          >
            Access Dashboard <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button 
            onClick={() => router.push('/products')}
            variant="outline"
            className="h-14 px-10 bg-slate-900/50 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white rounded-md text-lg font-semibold backdrop-blur-sm transition-all duration-300"
          >
            View Market Ledger
          </Button>
        </div>

        {/* Real-Time Market Ticker (Proof of Concept) */}
        <div className="w-full mt-32 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-800/80 pb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200 flex items-center tracking-wide">
              <span className="relative flex h-3 w-3 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Live Market Rates
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tracking-wider">LIVE FEDERATION</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {liveLoans.length > 0 ? liveLoans.slice(0, 3).map((loan) => (
              <div key={loan.id} className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-xl dark:shadow-2xl hover:border-blue-500/50 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{loan.bank_name}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">{loan.loan_type}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                      {(loan.interest_rate || loan.rate_apr)?.toFixed(2)}%
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Base APR</div>
                  </div>
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-2 flex justify-between items-center">
                  <span className="text-slate-500">Max Facility</span>
                  <span className="font-semibold">{formatCurrency(loan.max_amount)}</span>
                </div>
              </div>
            )) : (
              // Skeleton for public ticker
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-xl dark:shadow-2xl animate-pulse">
                  <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800/80 rounded mb-6"></div>
                  <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/80 rounded border-t border-slate-100 dark:border-slate-800 pt-4"></div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Enterprise Value Props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-24 text-left w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
          <div className="space-y-4 p-6 rounded-2xl bg-white/50 dark:bg-gradient-to-b dark:from-slate-900/40 dark:to-transparent border border-slate-200 dark:border-slate-800/50 shadow-sm dark:shadow-none">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.05)] dark:shadow-[0_0_15px_rgba(37,99,235,0.15)]">
              <LineChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-lg font-medium text-slate-900 dark:text-white tracking-tight">Data Integrity</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Strict formatting and zero-collision architecture for uncompromising data reliability and display perfection.</p>
          </div>
          <div className="space-y-4 p-6 rounded-2xl bg-white/50 dark:bg-gradient-to-b dark:from-slate-900/40 dark:to-transparent border border-slate-200 dark:border-slate-800/50 shadow-sm dark:shadow-none">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.05)] dark:shadow-[0_0_15px_rgba(37,99,235,0.15)]">
              <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-lg font-medium text-slate-900 dark:text-white tracking-tight">Compliance First</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Built to handle sensitive financial originations with absolute layout stability and data-flow security.</p>
          </div>
          <div className="space-y-4 p-6 rounded-2xl bg-white/50 dark:bg-gradient-to-b dark:from-slate-900/40 dark:to-transparent border border-slate-200 dark:border-slate-800/50 shadow-sm dark:shadow-none">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.05)] dark:shadow-[0_0_15px_rgba(37,99,235,0.15)]">
              <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-lg font-medium text-slate-900 dark:text-white tracking-tight">Real-Time Simulation</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Integrated market simulators provide live interest rate fluctuations dynamically mapped to your dashboard.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
