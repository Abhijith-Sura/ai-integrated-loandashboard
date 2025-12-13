import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { income, creditScore, loanAmount } = await req.json();

    if (!income || !creditScore || !loanAmount) {
      return NextResponse.json(
        { error: 'Income, credit score, and loan amount are required' },
        { status: 400 }
      );
    }

    // Mock AI recommendations (works offline)
    const incomeNum = parseFloat(income);
    const creditNum = parseInt(creditScore);
    const loanNum = parseFloat(loanAmount);

    const recommendations = `
🏦 **AI-Powered Loan Recommendations for You**

**Your Financial Profile:**
✓ Annual Income: ₹${incomeNum.toLocaleString('en-IN')}
✓ Credit Score: ${creditNum} ${creditNum >= 750 ? '(Excellent!)' : creditNum >= 650 ? '(Good)' : '(Fair)'}
✓ Desired Loan Amount: ₹${loanNum.toLocaleString('en-IN')}

---

**1. 💎 Premium Personal Loan**
**Recommended Amount:** ₹${Math.min(loanNum, incomeNum * 3).toLocaleString('en-IN')}
**Interest Rate:** ${creditNum >= 750 ? '10.5% - 12%' : creditNum >= 650 ? '12.5% - 14.5%' : '15% - 18%'}
**Why it's perfect:** Your ${creditNum >= 750 ? 'excellent' : 'good'} credit score qualifies you for ${creditNum >= 750 ? 'premium' : 'competitive'} rates. Quick disbursal in 24-48 hours with minimal documentation.
**Eligibility:** Monthly income ₹${(incomeNum / 12).toFixed(0)}, Age 21-60, Salaried/Self-employed

---

**2. 🏠 Home Loan Elite**
**Recommended Amount:** ₹${Math.min(loanNum, incomeNum * 5).toLocaleString('en-IN')}
**Interest Rate:** 8.5% - 11.5%
**Why it's perfect:** With income of ₹${(incomeNum / 100000).toFixed(1)} lakhs, you qualify for higher loan amounts. Best for property purchase or construction with flexible tenure up to 30 years.
**Eligibility:** Stable income, Property documents, Age 21-65

---

**3. 💼 Business Growth Loan**
**Recommended Amount:** ₹${Math.min(loanNum, incomeNum * 2.5).toLocaleString('en-IN')}
**Interest Rate:** ${creditNum >= 700 ? '12% - 14%' : '14% - 16%'}
**Why it's perfect:** No collateral required up to ₹50 lakhs. Perfect for business expansion, working capital, or equipment purchase. Fast approval process.
**Eligibility:** Business vintage 2+ years, GST registration, ITR filing

---

✅ **Next Steps:**
1. Visit the Products page to explore detailed loan features
2. Compare interest rates and tenures
3. Apply directly through our secure platform
4. Get instant pre-approval based on your profile

💡 **Pro Tip:** ${creditNum >= 750 ? 'Your excellent credit score gives you negotiating power for better rates!' : 'Improving your credit score by 50+ points can reduce interest rates by 2-3%!'}

📞 Need help? Our loan advisors are available 24/7.
    `;

    return NextResponse.json({ recommendations: recommendations.trim() });
  } catch (error: any) {
    console.error('AI recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations', details: error.message },
      { status: 500 }
    );
  }
}
