const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Read .env.local manually to avoid needing the `dotenv` package
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    });
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const banks = [
  'HDFC Bank', 'State Bank of India (SBI)', 'ICICI Bank', 'Axis Bank', 
  'Kotak Mahindra Bank', 'Bank of Baroda', 'Punjab National Bank', 
  'Union Bank of India', 'Canara Bank', 'Bajaj Finserv', 
  'Tata Capital', 'Muthoot Finance'
];

const loanTypes = [
  { type: 'Personal Loan', minApr: 10.5, maxApr: 21.0, minAmount: 50000, maxAmount: 4000000, minIncome: 25000, minScore: 650, tenures: [12, 24, 36, 48, 60], 
    featurePool: ['Instant Disbursal in 10 mins', 'Zero Pre-closure Charges', 'No Collateral Required', '100% Paperless Process', 'Pre-approved Offers Available', 'Flexible EMI Options', 'Minimal Documentation'] },
  { type: 'Home Loan', minApr: 8.4, maxApr: 10.5, minAmount: 1000000, maxAmount: 50000000, minIncome: 30000, minScore: 700, tenures: [120, 180, 240, 360], 
    featurePool: ['High LTV up to 90%', 'Special rates for Women', 'Tax Benefits under 80EEA', 'Doorstep Document Collection', 'Free Property Search Assistance', 'Home Renovation Included', 'Overdraft Facility'] },
  { type: 'Auto Loan', minApr: 8.8, maxApr: 12.5, minAmount: 100000, maxAmount: 5000000, minIncome: 20000, minScore: 600, tenures: [12, 36, 60, 84], 
    featurePool: ['Up to 100% On-road Financing', 'No Foreclosure Fees after 1 Year', 'Quick 4-hour Approval', 'Tie-ups with Top Dealers', 'Customizable Repayment', 'Balloon EMI Options'] },
  { type: 'Education Loan', minApr: 9.0, maxApr: 14.5, minAmount: 50000, maxAmount: 15000000, minIncome: 15000, minScore: 650, tenures: [60, 120, 180], 
    featurePool: ['Moratorium Period up to 1 Year', 'Co-applicant flexibility', 'Tax Benefits under 80E', 'Direct University Payout', 'Living Expenses Covered', 'Fast-track Visa Disbursal'] },
  { type: 'Gold Loan', minApr: 7.5, maxApr: 16.0, minAmount: 10000, maxAmount: 5000000, minIncome: 0, minScore: 0, tenures: [6, 12, 24, 36], 
    featurePool: ['Highest Per Gram Rate', 'Free Gold Insurance', 'Bullet Repayment Option', 'No CIBIL Check Required', '30-minute Disbursal', 'Overdraft Against Gold'] },
  { type: 'Business Loan', minApr: 14.0, maxApr: 24.0, minAmount: 500000, maxAmount: 20000000, minIncome: 50000, minScore: 700, tenures: [12, 24, 36, 48, 60], 
    featurePool: ['Unsecured Loan up to 50L', 'Fast Working Capital Approval', 'No Pre-part Payment Fees', 'SME Subsidies Applicable', 'Daily Installment Options', 'Inventory Financing'] },
  { type: 'Two-Wheeler Loan', minApr: 9.5, maxApr: 28.0, minAmount: 20000, maxAmount: 500000, minIncome: 15000, minScore: 600, tenures: [12, 24, 36, 48], 
    featurePool: ['Low EMI Schemes', 'Instant Dealer Disbursal', 'Zero Down Payment on EV', 'No Income Proof up to 1L', 'Free Accidental Cover', 'Helmet Funding'] },
  { type: 'Used Car Loan', minApr: 11.5, maxApr: 17.5, minAmount: 100000, maxAmount: 2500000, minIncome: 25000, minScore: 650, tenures: [12, 36, 60], 
    featurePool: ['Up to 85% Valuation Funding', 'Transparent Evaluation Process', 'Free RC Transfer Assistance', 'Warranty on Engine', 'Top-up Loans Available'] },
  { type: 'Medical Emergency Loan', minApr: 11.0, maxApr: 20.0, minAmount: 50000, maxAmount: 1000000, minIncome: 20000, minScore: 600, tenures: [12, 24, 36], 
    featurePool: ['Direct Hospital Payout', 'Instant 5-min Approval', 'No Waiting Period', 'Covers Surgery & Medicines', 'Zero Processing Fee for Emergencies'] },
  { type: 'Agri Loan', minApr: 7.0, maxApr: 12.0, minAmount: 25000, maxAmount: 10000000, minIncome: 0, minScore: 600, tenures: [12, 36, 60], 
    featurePool: ['Kisan Credit Card Integration', 'Low Government Subsidy Rates', 'Flexible Harvest Repayment', 'Tractor & Machinery Funding', 'No Foreclosure Fees'] }
];

const badges = [null, 'Best Overall', 'Lowest Interest', 'Fastest Approval', 'No Pre-closure Fee', 'Popular'];

// Helper to get n random distinct elements
function getRandomFeatures(pool, count) {
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateRandomProduct(bank, loanType) {
  const interest_rate = parseFloat((Math.random() * (loanType.maxApr - loanType.minApr) + loanType.minApr).toFixed(2));
  const max_amount = Math.floor(Math.random() * (loanType.maxAmount - loanType.minAmount) + loanType.minAmount);
  const rounded_max_amount = Math.ceil(max_amount / 10000) * 10000;
  
  const processing_fee_pct = (Math.random() * 3).toFixed(2);
  const processing_fee = Math.floor(rounded_max_amount * 0.01 * processing_fee_pct) || 999;
  
  const min_income = loanType.minIncome;
  const min_credit_score = loanType.minScore > 0 ? loanType.minScore + Math.floor(Math.random() * 100) : 0;
  
  const tenure_months = loanType.tenures[Math.floor(Math.random() * loanType.tenures.length)];
  const badge = badges[Math.floor(Math.random() * badges.length)];
  
  // Randomly pick 3 to 4 distinct features for realism
  const featureCount = Math.floor(Math.random() * 2) + 3;
  const selectedFeatures = getRandomFeatures(loanType.featurePool, featureCount);
  
  return {
    bank_name: bank,
    loan_type: loanType.type,
    interest_rate: interest_rate,
    max_amount: rounded_max_amount,
    min_income: min_income,
    min_credit_score: Math.min(min_credit_score, 850),
    processing_fee: processing_fee,
    tenure_months: tenure_months,
    features: selectedFeatures,
    badge: badge
  };
}

async function seedDatabase() {
  console.log("Clearing old products...");
  const { error: deleteError } = await supabase.from('products').delete().neq('id', 0);
  if (deleteError) {
    console.error("Failed to delete old products:", deleteError);
  }

  console.log("Generating products...");
  const products = [];
  
  // Generate a matrix of Bank x Loan Type = 120 Products
  for (const bank of banks) {
    for (const loanType of loanTypes) {
      products.push(generateRandomProduct(bank, loanType));
    }
  }

  console.log(`Generated ${products.length} loan products.`);
  console.log("Inserting into Supabase 'products' table...");

  // Supabase limits bulk inserts, but 120 rows is well within the 1000 row limit for a single insert
  const { data, error } = await supabase
    .from('products')
    .insert(products);

  if (error) {
    console.error("Error inserting data:", error);
  } else {
    console.log("Successfully seeded 120 loan products!");
  }
}

seedDatabase();
