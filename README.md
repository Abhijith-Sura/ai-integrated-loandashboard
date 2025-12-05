# ClickPe Loan Picks Dashboard

A Next.js application for personalized loan recommendations with AI-powered chat assistance.

## Features

✅ **Top 5 Personalized Loans** - Display best loan matches for users
✅ **Best Match Hero Card** - Highlight the top recommendation
✅ **Dynamic Badges** - 3+ contextual badges per product (Low APR, Fast Disbursal, etc.)
✅ **AI Chat Assistant** - Real-time loan product Q&A using Groq LLM (Llama 3.3 70B)
✅ **Responsive Design** - Mobile-first, accessible UI
✅ **PostgreSQL Database** - Supabase-hosted with 10+ seeded loan products

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: shadcn/ui with Tailwind CSS
- **Database**: PostgreSQL (Supabase)
- **AI**: Groq API (Llama 3.3 70B)
- **Validation**: Zod
- **Deployment**: Vercel

## Architecture

Next.js Frontend → API Routes → Supabase (PostgreSQL) + Groq API (LLM)



## Badge Logic

- **Low APR**: `rate_apr < 8%`
- **Fast Disbursal**: `disbursal_speed = 'fast'`
- **No Prepayment**: `prepayment_allowed = true`
- **Low Docs**: `docs_level = 'minimal'`
- **Zero Fee**: `processing_fee_pct = 0`

## AI Grounding Strategy

The chat assistant:
- Receives full product context (name, bank, APR, income, credit score, tenure, fees)
- Uses system prompt to restrict responses to the specific loan product only
- Maintains conversation history for contextual follow-ups
- Gracefully handles out-of-scope questions
- Limits responses to 300 tokens for conciseness

## Setup Instructions

1. **Clone repository**
git clone https://github.com/Abhijith-Sura/clickpe-loan-dashboard.git
cd clickpe-loan-dashboard



2. **Install dependencies**
npm install



3. **Environment variables**
Create `.env.local` file:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key



4. **Database setup**
- Create Supabase project
- Run SQL migrations (see database schema below)
- Seed with 10+ loan products

5. **Run development server**
npm run dev



6. **Deploy to Vercel**
vercel



## Database Schema

CREATE TABLE products (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name TEXT NOT NULL,
bank TEXT NOT NULL,
type TEXT,
rate_apr NUMERIC NOT NULL,
min_income NUMERIC NOT NULL,
min_credit_score INT NOT NULL,
tenure_min_months INT DEFAULT 6,
tenure_max_months INT DEFAULT 60,
processing_fee_pct NUMERIC DEFAULT 0,
prepayment_allowed BOOLEAN DEFAULT TRUE,
disbursal_speed TEXT DEFAULT 'standard',
docs_level TEXT DEFAULT 'standard',
summary TEXT,
faq JSONB DEFAULT '[]',
created_at TIMESTAMPTZ DEFAULT now()
);



## API Routes

- `GET /api/products` - Fetch loan products with filters
- `POST /api/ai/ask` - AI chat for product Q&A

## Project Structure

src/
├── app/
│ ├── page.tsx # Dashboard
│ └── api/
│ └── ai/ask/
│ └── route.ts # AI chat endpoint
├── components/
│ ├── ChatSheet.tsx # AI chat UI
│ └── ui/ # shadcn components
└── ...



## Assignment Deliverables

✅ Private GitHub repository (collaborators added)
✅ Working Vercel deployment
✅ PostgreSQL database with 10+ products
✅ README with architecture & setup
✅ Environment configuration example
✅ Video walkthrough (5-8 min)

## Live Demo

🔗 [Deployment URL will be added after Vercel deploy]

## Author

Abhijith Sura