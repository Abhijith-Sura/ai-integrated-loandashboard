'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Send, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  // Reset messages when product changes
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Hi! I'm here to help you with ${product.loan_type || product.product_type} from ${product.bank_name}. What would you like to know?`
      }
    ]);
  }, [product]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

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
            rate_apr: product.interest_rate || product.rate_apr || 0,
            min_income: product.min_income,
            min_credit_score: product.min_credit_score,
            tenure_min_months: product.tenure_min_months || 6,
            tenure_max_months: product.tenure_max_months || product.tenure_months || 60,
            processing_fee_pct: product.processing_fee || product.processing_fee_pct || 0,
            prepayment_allowed: product.prepayment_allowed ?? true,
            disbursal_speed: product.disbursal_speed || '24-48 hours',
            docs_level: 'Standard',
            summary: product.summary || `${product.loan_type || 'Loan'} from ${product.bank_name}`
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

        <ScrollArea className="flex-1 pr-4 my-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
          </div>
        </ScrollArea>

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