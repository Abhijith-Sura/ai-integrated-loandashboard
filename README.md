# 🏦 AI-Integrated Loan Dashboard (ClickPe)

A state-of-the-art, AI-powered loan comparison and recommendation platform. Built with the most modern web technologies, ClickPe features intelligent loan matching, ultra-fast real-time AI assistance, and a comprehensive financial management dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database/Auth-3ECF8E?style=for-the-badge&logo=supabase)
![Groq](https://img.shields.io/badge/AI-Groq_Llama_3.3-orange?style=for-the-badge)

## 🌟 Core Features

### 🤖 Intelligent AI Recommendations
- **Dynamic Matching:** Personalized loan suggestions based on income, credit score, and desired amount using **Llama 3.3 (70B)**.
- **Global AI Chat:** A floating real-time assistant available across the entire platform.
- **Product-Specific Context:** Instant answers about interest rates, eligibility, and documentation for specific loan products.

### 📊 Comprehensive Loan Engine
- **120+ Real-world Loan Products:** Pre-seeded data across Personal, Home, Business, Education, Vehicle, and Gold loans.
- **Interactive Comparison:** Compare interest rates, processing fees, and tenures side-by-side.
- **PDF Reports:** Generate and download professional loan comparison reports using `jsPDF`.

### 🔐 Enterprise-Grade Security
- **Supabase Auth (SSR):** Secure, server-side authenticated sessions.
- **Role-Based Access:** Protected routes for dashboard and management features.
- **Email Intelligence:** Integrated password recovery and notifications via **Resend**.

### 📱 Premium UI/UX
- **Tailwind 4.0 Engine:** Utilizing the latest CSS capabilities for high-performance styling.
- **Shadcn UI:** Custom-built components using Radix UI primitives.
- **Micro-animations:** Smooth transitions and hover effects for a "premium feel."

## 🚀 Tech Stack (Actual)

- **Frontend Framework:** Next.js 16.2 (App Router)
- **Language:** TypeScript
- **UI Library:** React 19 (Latest)
- **Styling:** Tailwind CSS 4.0
- **Database & Auth:** Supabase (PostgreSQL + SSR Auth)
- **AI Engine:** Groq SDK (Model: `llama-3.3-70b-versatile`)
- **Orchestration:** Vercel AI SDK (`ai` package)
- **Components:** Shadcn UI + Lucide Icons
- **Communications:** Resend API
- **Exports:** jsPDF + AutoTable

## 📦 Getting Started

### 1. Prerequisites
- Node.js 20+
- Supabase Project
- Groq API Key

### 2. Environment Setup
Create a `.env.local` file in the root:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Engine
GROQ_API_KEY=your_groq_api_key

# Email (Optional)
RESEND_API_KEY=your_resend_api_key
```

### 3. Installation
```bash
npm install
npm run dev
```

## 🔧 Deployment (Vercel)

1. **Connect GitHub:** Link your repository to Vercel.
2. **Environment Variables:** **IMPORTANT:** You MUST add your `.env.local` variables to the Vercel Dashboard and ensure they are scoped to **Production**.
3. **Build:** Vercel will automatically detect Next.js and build using `npm run build`.

## 📁 Project Structure
```text
src/
├── app/          # Next.js 16 App Router (API + Pages)
├── components/   # React Components (UI + Global Chat)
├── lib/          # Shared utilities and SDK initializations
├── hooks/        # Custom React hooks
└── scripts/      # Database seeding scripts (seed-loans.js)
```

---

**Built with ❤️ by [Abhijith Sura](https://github.com/Abhijith-Sura)**  
*Modernizing financial products with AI.*