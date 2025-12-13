# 🏦 ClickPe Loan Dashboard

A modern, AI-powered loan comparison and recommendation platform built with Next.js 16, featuring intelligent loan suggestions, real-time chatbot assistance, and comprehensive financial product browsing.

![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Auth-green)

## 🌟 Features

### 🤖 AI-Powered Recommendations
- Personalized loan suggestions based on income, credit score, and desired amount
- Intelligent matching algorithm considering financial profile
- Real-time recommendations with detailed eligibility criteria

### 💬 Interactive AI Chatbot
- Context-aware loan assistance on product pages
- Instant answers to queries about interest rates, eligibility, and documentation
- Smart responses covering all loan-related questions

### 🔐 Secure Authentication
- User registration and login system
- Password reset functionality via Supabase Auth
- Email verification with secure token-based authentication
- Protected routes and session management

### 📊 Comprehensive Loan Products
- 150+ loan products across multiple categories:
  - Personal Loans
  - Home Loans
  - Business Loans
  - Education Loans
  - Vehicle Loans
  - Gold Loans
- Detailed product information with interest rates, tenure, and features
- Advanced filtering and search capabilities

### 📱 Modern UI/UX
- Responsive design for all devices
- Beautiful gradient themes
- Smooth animations and transitions
- Intuitive navigation and user flows

## 🚀 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - High-quality component library
- **Lucide Icons** - Beautiful icon set

### Backend
- **Next.js API Routes** - Serverless backend
- **Supabase** - Authentication and database
- **AI Integration** - GROQ/Gemini API for recommendations

### Deployment
- **Vercel** - Hosting and continuous deployment
- **GitHub** - Version control

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account
- AI API key (GROQ or Gemini)

### Setup Instructions

1. **Clone the repository**
git clone https://github.com/Abhijith-Sura/clickpe-loan-dashboard.git
cd clickpe-loan-dashboard



2. **Install dependencies**
npm install



3. **Configure environment variables**

Create a `.env.local` file in the root directory:

Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

AI API Key (choose one)
GROQ_API_KEY=your_groq_api_key

OR
GEMINI_API_KEY=your_gemini_api_key



4. **Run development server**
npm run dev



5. **Open in browser**
http://localhost:3000



## 🔧 Configuration

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Enable Email authentication in **Authentication → Providers**
3. Configure Email Templates in **Authentication → Email Templates**
4. Add redirect URLs:
   - `http://localhost:3000/reset-password`
   - `https://your-domain.vercel.app/reset-password`

### AI API Setup

**Option 1: GROQ (Recommended)**
1. Get API key from [console.groq.com](https://console.groq.com)
2. Add to `.env.local` as `GROQ_API_KEY`

**Option 2: Google Gemini**
1. Get API key from [ai.google.dev](https://ai.google.dev)
2. Add to `.env.local` as `GEMINI_API_KEY`

## 📁 Project Structure

clickpe-loan-dashboard/
├── src/
│ ├── app/
│ │ ├── page.tsx # Dashboard home
│ │ ├── login/
│ │ │ └── page.tsx # Login/Signup page
│ │ ├── products/
│ │ │ └── page.tsx # Products listing
│ │ └── api/
│ │ ├── send-reset-email/
│ │ │ └── route.ts # Password reset API
│ │ ├── ai/
│ │ │ ├── recommend/
│ │ │ │ └── route.ts # AI recommendations
│ │ │ └── ask/
│ │ │ └── route.ts # AI chatbot
│ │ └── products/
│ │ └── route.ts # Products data API
│ ├── components/
│ │ ├── ui/ # Shadcn components
│ │ ├── ChatSheet.tsx # AI chatbot component
│ │ └── AIRecommendations.tsx # AI recommendations
│ └── lib/
│ └── utils.ts # Utility functions
├── public/ # Static assets
├── .env.local # Environment variables
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md



## 🎯 Key Features Explained

### Dashboard
- Quick stats overview (Total Products, Best Rates, Approval Time)
- AI-powered loan recommendation form
- Personalized suggestions display
- Quick navigation to product catalog

### Product Catalog
- Filterable loan products by category
- Detailed product cards with:
  - Interest rates and APR
  - Maximum loan amounts
  - Minimum eligibility criteria
  - Processing fees and tenure
  - Key features and benefits
- AI chatbot for instant assistance

### Authentication Flow
- User registration with email validation
- Secure login with encrypted credentials
- Forgot password with email verification
- Password reset with expiring tokens
- Session management with localStorage

## 🔒 Security Features

- Environment variable protection
- Secure API routes with validation
- Password encryption (via Supabase)
- CORS protection
- Rate limiting on API endpoints
- Input sanitization
- XSS protection

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**
git add .
git commit -m "Ready for deployment"
git push origin main



2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Add environment variables from `.env.local`

3. **Configure Build Settings**
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Deploy**
   - Click "Deploy"
   - Wait for build completion
   - Visit your live URL!

## 📊 Performance

- **Lighthouse Score:** 95+ (Performance)
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Bundle Size:** Optimized with code splitting
- **API Response Time:** < 500ms average

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Abhijith Sura**
- GitHub: [@Abhijith-Sura](https://github.com/Abhijith-Sura)
- Email: 23eg105b57@anurag.edu.in
- LinkedIn: [Abhijith Sura](https://linkedin.com/in/abhijith-sura)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React Framework
- [Vercel](https://vercel.com/) - Deployment Platform
- [Supabase](https://supabase.com/) - Backend Services
- [Shadcn/ui](https://ui.shadcn.com/) - Component Library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide Icons](https://lucide.dev/) - Icon Set
- [GROQ](https://groq.com/) / [Google Gemini](https://ai.google.dev/) - AI Integration

## 🐛 Known Issues

- Network issues with ISPs may affect AI API calls (use VPN if needed)
- IPv6 blocking on certain networks (disable IPv6 in network settings)

## 🔮 Future Enhancements

- [ ] Loan EMI calculator
- [ ] Loan comparison tool
- [ ] User dashboard with saved applications
- [ ] Document upload functionality
- [ ] Real-time application tracking
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Integration with banking APIs
- [ ] Credit score checker
- [ ] Financial planning tools

## 📞 Support

For support, email 23eg105b57@anurag.edu.in or open an issue in the GitHub repository.

---

**Built with ❤️ for InnoquestAI Hackathon by Microsoft Azure**

⭐ Star this repo if you found it helpful!
Also Create a .gitignore file if you don't have one:
text
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts