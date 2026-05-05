'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Search, Filter, MoreHorizontal, CheckCircle2, XCircle, Clock, TrendingUp, AlertTriangle, Briefcase, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Data Mocking
type LoanStatus = 'Active' | 'Paid' | 'Defaulted';

interface ManagedLoan {
  loanId: string;
  borrowerName: string;
  principalAmount: number;
  interestRate: number;
  status: LoanStatus;
  progressPercentage: number;
  issueDate: string;
}

const mockLoans: ManagedLoan[] = [
  { loanId: "L-88392", borrowerName: "Rajesh Kumar Enterprises", principalAmount: 25000000, interestRate: 8.5, status: "Active", progressPercentage: 35, issueDate: "2024-01-15" },
  { loanId: "L-88393", borrowerName: "Meera Solutions Pvt Ltd", principalAmount: 12500000, interestRate: 9.2, status: "Paid", progressPercentage: 100, issueDate: "2023-06-10" },
  { loanId: "L-88394", borrowerName: "Vikram Singh", principalAmount: 4500000, interestRate: 10.5, status: "Defaulted", progressPercentage: 15, issueDate: "2025-11-20" },
  { loanId: "L-88395", borrowerName: "Apex Logistics Group", principalAmount: 85000000, interestRate: 7.8, status: "Active", progressPercentage: 62, issueDate: "2023-09-05" },
  { loanId: "L-88396", borrowerName: "Sunita Sharma", principalAmount: 1200000, interestRate: 11.0, status: "Active", progressPercentage: 88, issueDate: "2022-04-12" },
  { loanId: "L-88397", borrowerName: "Nexus Tech Partners", principalAmount: 34000000, interestRate: 8.9, status: "Active", progressPercentage: 5, issueDate: "2026-02-01" },
];

export default function ManagementDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LoanStatus | 'All'>('All');

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.replace('/login');
      return;
    }
  }, [router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: LoanStatus) => {
    switch (status) {
      case 'Active': 
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"><Clock className="w-3 h-3 mr-1" /> Active</span>;
      case 'Paid': 
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</span>;
      case 'Defaulted': 
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"><XCircle className="w-3 h-3 mr-1" /> Defaulted</span>;
    }
  };

  const filteredLoans = mockLoans.filter(loan => {
    const matchesSearch = loan.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          loan.loanId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ['Loan ID', 'Borrower Entity', 'Principal Amount', 'Interest Rate', 'Status', 'Progress %', 'Issue Date'];
    const csvContent = [
      headers.join(','),
      ...filteredLoans.map(loan => 
        `"${loan.loanId}","${loan.borrowerName}",${loan.principalAmount},${loan.interestRate},"${loan.status}",${loan.progressPercentage},"${loan.issueDate}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'enterprise_portfolio.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Enterprise Portfolio Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableData = filteredLoans.map(loan => [
      loan.loanId,
      loan.borrowerName,
      formatCurrency(loan.principalAmount),
      `${loan.interestRate.toFixed(2)}%`,
      loan.status,
      `${loan.progressPercentage}%`,
      loan.issueDate
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Loan ID', 'Borrower Entity', 'Principal', 'Base APR', 'Status', 'Progress', 'Issue Date']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] } // Tailwind blue-600
    });

    doc.save('enterprise_portfolio.pdf');
  };

  const handleAction = (loanId: string) => {
    alert(`Action menu opened for Loan ${loanId}.\n(In a real app, this would open a side panel to edit terms, trigger collections, or issue waivers)`);
  };

  // Calculate KPIs
  const totalPortfolio = mockLoans.reduce((sum, loan) => sum + loan.principalAmount, 0);
  const activeLoans = mockLoans.filter(l => l.status === 'Active').length;
  const defaultedLoans = mockLoans.filter(l => l.status === 'Defaulted').length;
  const defaultRate = ((defaultedLoans / mockLoans.length) * 100).toFixed(1);

  if (!mounted) return null;

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 font-sans transition-colors duration-150 relative overflow-hidden">
      
      {/* Background Image & Overlays */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="fixed inset-0 z-0 bg-white/75 dark:bg-slate-950/85 pointer-events-none transition-colors duration-150" />
      
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 dark:text-white">Enterprise Portfolio</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time overview of institutional and retail lending facilities.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-lg p-5 shadow-lg flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">YTD</span>
            </div>
            <div className="mt-auto">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Portfolio Value</p>
              <h3 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight mt-1">{formatCurrency(totalPortfolio)}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">Active</span>
            </div>
            <div className="mt-auto">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Facilities</p>
              <h3 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight mt-1">{activeLoans} <span className="text-sm font-normal text-slate-400">Accounts</span></h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-100 dark:border-red-800">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">At Risk</span>
            </div>
            <div className="mt-auto">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Portfolio Default Rate</p>
              <h3 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight mt-1">{defaultRate}%</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-800">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">30 Days</span>
            </div>
            <div className="mt-auto">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Interest Yield</p>
              <h3 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight mt-1">9.15%</h3>
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search borrower or Loan ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-md bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-lg"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-md p-1 shadow-lg">
              <button 
                onClick={() => setStatusFilter('All')} 
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${statusFilter === 'All' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                All
              </button>
              <button 
                onClick={() => setStatusFilter('Active')} 
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${statusFilter === 'Active' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setStatusFilter('Paid')} 
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${statusFilter === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Paid
              </button>
              <button 
                onClick={() => setStatusFilter('Defaulted')} 
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${statusFilter === 'Defaulted' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Defaulted
              </button>
            </div>
            <Button onClick={handleExportCSV} variant="outline" className="h-10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border-slate-200/80 dark:border-slate-700/80 shadow-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50/90 dark:hover:bg-slate-800/90">
              <Download className="w-4 h-4 mr-2" /> CSV
            </Button>
            <Button onClick={handleExportPDF} className="h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              <FileText className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>
        </div>

        {/* Enterprise Data Table */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-lg shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50/50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200/80 dark:border-slate-800/80">
                <tr>
                  <th className="px-6 py-4">Loan ID</th>
                  <th className="px-6 py-4">Borrower Entity</th>
                  <th className="px-6 py-4 text-right">Principal</th>
                  <th className="px-6 py-4 text-right">Base APR</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Payment Progress</th>
                  <th className="px-6 py-4">Origination</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredLoans.map((loan) => (
                  <tr key={loan.loanId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{loan.loanId}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{loan.borrowerName}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">{formatCurrency(loan.principalAmount)}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">{loan.interestRate.toFixed(2)}%</td>
                    <td className="px-6 py-4">{getStatusBadge(loan.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              loan.status === 'Active' ? 'bg-blue-500' : loan.status === 'Paid' ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${loan.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 w-8">{loan.progressPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{loan.issueDate}</td>
                    <td className="px-6 py-4 text-right">
                      <Button onClick={() => handleAction(loan.loanId)} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredLoans.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 text-sm">No loans found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
