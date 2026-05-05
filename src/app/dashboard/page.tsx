'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, TrendingUp, Clock, Shield, Building2, Landmark, CheckCircle2, AlertCircle } from 'lucide-react';
import { ChatSheet } from '@/components/ChatSheet';
import { Header } from '@/components/Header';

// Translation Dictionary
const translations = {
  en: {
    title: "Enterprise Loan Servicing Dashboard",
    welcome: "Welcome",
    logout: "Sign Out",
    stats: {
      total: "Active Products",
      totalDesc: "Available loan vehicles",
      rate: "Market Base Rate",
      rateDesc: "Current minimum APR",
      speed: "SLA Adherence",
      speedDesc: "Approval turnaround time",
      secure: "Compliance",
      secureDesc: "Regulatory standards met"
    },
    aiForm: {
      title: "Risk & Recommendation Engine",
      desc: "Input applicant financial metrics for risk-adjusted loan targeting.",
      income: "Annual Gross Income (INR)",
      credit: "Credit Score (CIBIL)",
      amount: "Requested Facility Amount (INR)",
      btn: "Generate Assessment",
      loading: "Processing Matrix..."
    },
    liveFeed: {
      title: "Live Market Originations",
      desc: "Real-time snapshot of active loan products from federated banks.",
      viewAll: "Access Complete Ledger"
    }
  },
  hi: {
    title: "एंटरप्राइज़ ऋण सेवा डैशबोर्ड",
    welcome: "स्वागत है",
    logout: "साइन आउट",
    stats: {
      total: "सक्रिय उत्पाद",
      totalDesc: "उपलब्ध ऋण विकल्प",
      rate: "बाज़ार आधार दर",
      rateDesc: "वर्तमान न्यूनतम एपीआर",
      speed: "SLA अनुपालन",
      speedDesc: "अनुमोदन का समय",
      secure: "अनुपालन",
      secureDesc: "नियामक मानकों को पूरा किया"
    },
    aiForm: {
      title: "जोखिम और सिफ़ारिश इंजन",
      desc: "जोखिम-समायोजित ऋण लक्ष्यीकरण के लिए आवेदक वित्तीय मैट्रिक्स इनपुट करें।",
      income: "वार्षिक सकल आय (INR)",
      credit: "क्रेडिट स्कोर (CIBIL)",
      amount: "अनुरोधित सुविधा राशि (INR)",
      btn: "मूल्यांकन उत्पन्न करें",
      loading: "मैट्रिक्स संसाधित हो रहा है..."
    },
    liveFeed: {
      title: "लाइव बाज़ार उत्पत्ति",
      desc: "संबद्ध बैंकों से सक्रिय ऋण उत्पादों का रीयल-टाइम स्नैपशॉट।",
      viewAll: "संपूर्ण खाता बही तक पहुँचें"
    }
  },
  es: {
    title: "Panel de Servicio de Préstamos Empresariales",
    welcome: "Bienvenido",
    logout: "Cerrar Sesión",
    stats: {
      total: "Productos Activos",
      totalDesc: "Vehículos de préstamo disponibles",
      rate: "Tasa Base del Mercado",
      rateDesc: "APR mínimo actual",
      speed: "Cumplimiento SLA",
      speedDesc: "Tiempo de respuesta",
      secure: "Cumplimiento",
      secureDesc: "Estándares cumplidos"
    },
    aiForm: {
      title: "Motor de Riesgo y Recomendación",
      desc: "Ingrese métricas financieras para evaluación ajustada por riesgo.",
      income: "Ingreso Bruto Anual (INR)",
      credit: "Puntaje de Crédito (CIBIL)",
      amount: "Monto Solicitado (INR)",
      btn: "Generar Evaluación",
      loading: "Procesando Matriz..."
    },
    liveFeed: {
      title: "Originaciones de Mercado en Vivo",
      desc: "Instantánea en tiempo real de productos activos de bancos federados.",
      viewAll: "Acceder al Libro Mayor"
    }
  }
};

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
  rate_apr?: number;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [lang, setLang] = useState<'en' | 'hi' | 'es'>('en');
  
  const [income, setIncome] = useState('');
  const [creditScore, setCreditScore] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [liveLoans, setLiveLoans] = useState<Loan[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Loan | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const router = useRouter();

  const t = translations[lang];

  // Formatting utilities
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('app_lang') as 'en' | 'hi' | 'es';
    if (savedLang) setLang(savedLang);

    const handleLangChange = () => {
      const newLang = localStorage.getItem('app_lang') as 'en' | 'hi' | 'es';
      if (newLang) setLang(newLang);
    };

    window.addEventListener('app_lang_changed', handleLangChange);
    return () => window.removeEventListener('app_lang_changed', handleLangChange);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.replace('/login');
    } else {
      setIsAuthenticated(true);
      const name = localStorage.getItem('user_name');
      if (name) setUserName(name);
      fetchLiveLoans();
    }
  }, [mounted, router]);

  const fetchLiveLoans = async () => {
    try {
      setIsFeedLoading(true);
      const response = await fetch('/api/products?limit=4');
      const data = await response.json();
      if (data.success) {
        setLiveLoans(data.products);
      }
    } catch (e) {
      console.error("Failed to fetch live feed", e);
    } finally {
      setIsFeedLoading(false);
    }
  };



  const getRecommendations = async () => {
    if (!income || !creditScore || !loanAmount) {
      alert('Please complete all financial metrics.');
      return;
    }

    setLoading(true);
    setAiRecommendations('');
    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: parseFloat(income),
          creditScore: parseInt(creditScore),
          loanAmount: parseFloat(loanAmount),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setAiRecommendations(data.recommendations);
    } catch (error: any) {
      alert('Failed to process risk assessment.');
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 dark:border-slate-700 dark:border-t-slate-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans text-slate-900 dark:text-slate-100 transition-colors duration-150 relative overflow-hidden`}>
      {/* Dynamic Architectural Background Image */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-500"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="fixed inset-0 z-0 bg-white/75 dark:bg-slate-950/85 pointer-events-none transition-colors duration-150" />

      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* KPI Row (Structured Enterprise Stats) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: t.stats.total, value: "120", desc: t.stats.totalDesc, icon: TrendingUp },
            { title: t.stats.rate, value: "7.00%", desc: t.stats.rateDesc, icon: Landmark },
            { title: t.stats.speed, value: "< 24 Hrs", desc: t.stats.speedDesc, icon: Clock },
            { title: t.stats.secure, value: "Verified", desc: t.stats.secureDesc, icon: Shield }
          ].map((stat, i) => (
            <div key={i} className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-lg shadow-lg flex flex-col justify-between transition-all duration-150">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</h3>
                <stat.icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </div>
              <div>
                <div className="text-2xl font-medium tracking-tight text-slate-900 dark:text-slate-100">{stat.value}</div>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{stat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Layout for Main Workflows */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Risk Engine Form */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-lg shadow-lg transition-colors duration-150">
              <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-500" />
                  {t.aiForm.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.aiForm.desc}</p>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">{t.aiForm.income}</label>
                  <Input
                    type="number"
                    placeholder="e.g. 500000"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="h-9 text-sm rounded-md border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-950/60 focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">{t.aiForm.credit}</label>
                  <Input
                    type="number"
                    placeholder="e.g. 750"
                    value={creditScore}
                    onChange={(e) => setCreditScore(e.target.value)}
                    className="h-9 text-sm rounded-md border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-950/60 focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">{t.aiForm.amount}</label>
                  <Input
                    type="number"
                    placeholder="e.g. 1000000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="h-9 text-sm rounded-md border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-950/60 focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors shadow-inner"
                  />
                </div>
                
                <Button 
                  onClick={getRecommendations} 
                  disabled={loading} 
                  className="w-full h-9 mt-2 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700 rounded-md transition-colors duration-150"
                >
                  {loading ? (
                    <><div className="w-3 h-3 mr-2 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div> {t.aiForm.loading}</>
                  ) : (
                    t.aiForm.btn
                  )}
                </Button>
              </div>
            </div>

            <Button 
              onClick={() => router.push('/products')} 
              variant="outline" 
              className="w-full h-10 text-sm bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-lg border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50/90 dark:hover:bg-slate-800/90 transition-colors duration-150"
            >
              {t.liveFeed.viewAll}
            </Button>
          </div>

          {/* Right Column: Live Feed / Demo Cards & Results */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* AI Results Output - Enterprise Style */}
            {aiRecommendations && (
              <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-blue-200/80 dark:border-blue-900/50 rounded-lg shadow-lg p-5 transition-all duration-150 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center mb-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 mr-2" />
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Assessment Report</h3>
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-mono bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm p-4 rounded border border-slate-200/80 dark:border-slate-800/80 shadow-inner">
                  {aiRecommendations}
                </div>
              </div>
            )}

            {/* Live Feed Ledger */}
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-lg shadow-lg overflow-hidden transition-all duration-150">
              <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {t.liveFeed.title}
                  </h2>
                </div>
                <span className="text-xs text-slate-500">{t.liveFeed.desc}</span>
              </div>
              
              <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
                {isFeedLoading ? (
                  // Skeleton Loaders - Exact height match
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-5 flex items-center justify-between animate-pulse">
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                        <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded"></div>
                      </div>
                      <div className="w-32 mr-8">
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-2"></div>
                        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </div>
                      <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                    </div>
                  ))
                ) : liveLoans.length > 0 ? (
                  liveLoans.map((loan) => (
                    <div key={loan.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors duration-150 gap-4">
                      
                      {/* Left: Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {loan.loan_type}
                          </h3>
                          {loan.badge && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {loan.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center">
                          <Landmark className="w-3 h-3 mr-1" /> {loan.bank_name}
                        </p>
                      </div>

                      {/* Middle: Limits / Progress Bar Simulation */}
                      <div className="w-full sm:w-48 flex-shrink-0">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
                          <span>Facility Limit</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(loan.max_amount)}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-1.5 overflow-hidden">
                          <div className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.max(30, Math.min(100, (loan.max_amount / 50000000) * 100))}%` }}></div>
                        </div>
                        <div className="text-[10px] text-slate-500 flex justify-between">
                          <span>Tenure: {loan.tenure_months} mo</span>
                          <span>Min CIBIL: {loan.min_credit_score}</span>
                        </div>
                      </div>

                      {/* Right: Rate & Action */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-lg font-medium text-slate-900 dark:text-slate-100">
                            {(loan.interest_rate || loan.rate_apr)?.toFixed(2)}%
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">Base APR</div>
                        </div>
                        <Button 
                          onClick={() => openChat(loan)}
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm border-slate-200/80 dark:border-slate-700/80 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors duration-150"
                        >
                          <MessageCircle className="w-3 h-3 mr-1.5" /> Chat
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center flex flex-col items-center justify-center text-slate-500">
                    <AlertCircle className="w-8 h-8 mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm">No live market data available.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Structured Chat Sheet */}
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
