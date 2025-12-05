'use client';

import { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  bank: string;
  rate_apr: number;
  summary: string;
  min_income: number;
  min_credit_score: number;
  tenure_min_months: number;
  tenure_max_months: number;
  faq: any[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatSheet({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          message: userMessage,
          history: messages,
          productData: product,
        }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" variant="outline" className="w-full">
        <MessageCircle className="w-4 h-4 mr-2" />
        Ask About This Product
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:w-96 flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-left">{product.name}</SheetTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{product.bank}</Badge>
              <Badge className="bg-blue-600">{product.rate_apr}% APR</Badge>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-2">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 mt-8">
                <p className="text-sm">Ask me anything about this loan product!</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <Card className={`max-w-xs p-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>
                  <p className="text-sm">{msg.content}</p>
                </Card>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <Card className="bg-slate-100 p-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2 border-t pt-4">
            <Input
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
