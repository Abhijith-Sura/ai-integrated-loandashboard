'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Send, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Product {
  id: number;
  bank_name: string;
  loan_type?: string;
  product_type?: string;
  interest_rate?: number;
  rate_apr?: number;
  max_amount: number;
  min_income: number;
  min_credit_score: number;
  processing_fee?: number;
  processing_fee_pct?: number;
  tenure_months?: number;
  tenure_min_months?: number;
  tenure_max_months?: number;
  prepayment_allowed?: boolean;
  disbursal_speed?: string;
  summary?: string;
}

interface ChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

export function ChatSheet({ open, onOpenChange, product }: ChatSheetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset messages when product changes
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Hi! I'm here to help you with ${product.loan_type || product.product_type} from ${product.bank_name}. What would you like to know?`
      }
    ]);
  }, [product]);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    const p = product.max_amount;
    const annualRate = product.interest_rate || product.rate_apr || 10;
    const r = annualRate / 12 / 100;
    const n = product.tenure_max_months || product.tenure_months || 60;
    const estimatedEmi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    const getApplyLink = (bank: string, type: string) => {
      const b = bank.toLowerCase();
      const t = type.toLowerCase();
      
      if (b.includes('hdfc')) {
        if (t.includes('home')) return 'https://homeloans.hdfc.bank.in/';
        if (t.includes('auto') || t.includes('car')) return 'https://www.hdfcbank.com/personal/borrow/popular-loans/new-car-loan';
        if (t.includes('personal')) return 'https://www.hdfcbank.com/personal/borrow/popular-loans/personal-loan';
        if (t.includes('business')) return 'https://www.hdfcbank.com/sme/borrow/business-loans';
        return 'https://www.hdfcbank.com/personal/borrow';
      }
      if (b.includes('sbi') || b.includes('state bank')) {
        if (t.includes('home')) return 'https://homeloans.sbi/';
        if (t.includes('auto') || t.includes('car')) return 'https://sbi.co.in/web/personal-banking/loans/auto-loans';
        if (t.includes('personal')) return 'https://sbi.co.in/web/personal-banking/loans/personal-loans';
        if (t.includes('gold')) return 'https://sbi.co.in/web/personal-banking/loans/gold-loan';
        return 'https://sbi.co.in/web/personal-banking/loans';
      }
      if (b.includes('icici')) {
        if (t.includes('home')) return 'https://www.icicibank.com/personal-banking/loans/home-loan';
        if (t.includes('auto') || t.includes('car')) return 'https://www.icicibank.com/personal-banking/loans/car-loan';
        if (t.includes('personal')) return 'https://www.icicibank.com/personal-banking/loans/personal-loan';
        if (t.includes('gold')) return 'https://www.icicibank.com/personal-banking/loans/gold-loan';
        return 'https://www.icicibank.com/personal-banking/loans';
      }
      if (b.includes('axis')) {
        if (t.includes('home')) return 'https://www.axisbank.com/retail/loans/home-loan';
        if (t.includes('personal')) return 'https://www.axisbank.com/retail/loans/personal-loan';
        if (t.includes('auto') || t.includes('car')) return 'https://www.axisbank.com/retail/loans/car-loan';
        return 'https://www.axisbank.com/retail/loans';
      }
      if (b.includes('bajaj')) {
        if (t.includes('personal')) return 'https://www.bajajfinserv.in/personal-loan';
        if (t.includes('home')) return 'https://www.bajajfinserv.in/home-loan';
        if (t.includes('business')) return 'https://www.bajajfinserv.in/business-loan';
        return 'https://www.bajajfinserv.in/loans';
      }
      if (b.includes('kotak')) {
        if (t.includes('personal')) return 'https://www.kotak.com/en/personal-banking/loans/personal-loan.html';
        if (t.includes('home')) return 'https://www.kotak.com/en/personal-banking/loans/home-loan.html';
        return 'https://www.kotak.com/en/personal-banking/loans.html';
      }
      if (b.includes('tata')) {
        if (t.includes('home')) return 'https://www.tatacapital.com/home-loan.html';
        if (t.includes('business')) return 'https://www.tatacapital.com/business-loan.html';
        return 'https://www.tatacapital.com/personal-loan.html';
      }
      if (b.includes('muthoot')) {
        return 'https://www.muthootfinance.com/gold-loan';
      }
      
      const fallbacks: Record<string, string> = {
        'bank of baroda': 'https://www.bankofbaroda.in/personal-banking/loans',
        'punjab national bank': 'https://www.pnbindia.in/loans.html',
        'union bank': 'https://www.unionbankofindia.co.in/english/personal-loan.aspx',
        'canara': 'https://canarabank.com/loans'
      };
      
      for (const [key, val] of Object.entries(fallbacks)) {
        if (b.includes(key)) return val;
      }

      return `https://www.google.com/search?q=${encodeURIComponent(`official ${bank} ${type} apply online`)}`;
    };

    const applyLink = getApplyLink(product.bank_name, product.loan_type || product.product_type || 'loan');

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id.toString(),
          message: userMessage,
          history: newMessages.slice(1).map(m => ({ role: m.role, content: m.content })),
          productData: {
            name: product.loan_type || product.product_type || 'Personal Loan',
            bank: product.bank_name,
            max_amount: p,
            rate_apr: annualRate,
            min_income: product.min_income,
            min_credit_score: product.min_credit_score,
            tenure_min_months: product.tenure_min_months || 6,
            tenure_max_months: n,
            processing_fee_pct: product.processing_fee || product.processing_fee_pct || 0,
            prepayment_allowed: product.prepayment_allowed ?? true,
            disbursal_speed: product.disbursal_speed || '24-48 hours',
            docs_level: 'Standard',
            summary: product.summary || `${product.loan_type || 'Loan'} from ${product.bank_name}`,
            calculated_emi_for_max_amount: Math.round(estimatedEmi || 0),
            apply_link: applyLink
          }
        })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer || 'Sorry, I had trouble processing that.'
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>{product.loan_type || product.product_type}</SheetTitle>
          <SheetDescription>
            {product.bank_name} • {product.interest_rate || product.rate_apr}% APR
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 pr-4 my-4 overflow-y-auto min-h-0 scroll-smooth">
          <div className="space-y-4 pb-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-xl px-4 py-3 max-w-[85%] prose prose-sm dark:prose-invert ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white prose-p:text-white prose-a:text-blue-200'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-900 dark:text-slate-100 prose-a:text-blue-600 dark:prose-a:text-blue-400'
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      a: ({ node, ...props }) => (
                        <a target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-2 underline-offset-2 hover:opacity-80 transition-opacity" {...props} />
                      )
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Ask about this loan..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}