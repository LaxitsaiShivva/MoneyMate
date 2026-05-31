import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Trash2,
  Edit3,
  Camera,
  Sparkles,
  Info,
  Calendar,
  X,
  RefreshCw,
  FileText
} from 'lucide-react';
import { Transaction } from '../types';

interface ExpenseTrackerProps {
  transactions: Transaction[];
  currencySymbol: string;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onEditTransaction: (id: string, t: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
}

// Sample base64 receipts to let the user test vision OCR out of the box!
const sampleReceipts = [
  {
    name: 'Sample Starbucks Coffee (₹350)',
    notes: 'Starbucks Coffee - Ventí Latte & Croissant',
    amount: 350,
    category: 'Food',
    date: '2026-05-30',
    // Minimal standard base64 grey pixel to represent photo
    data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  },
  {
    name: 'Sample Electronics Store (₹24,900)',
    notes: 'SuperAudio soundbar purchase invoice #8922',
    amount: 24900,
    category: 'Shopping',
    date: '2026-05-28',
    data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  },
  {
    name: 'City Care Hospital Pharmacy Receipt (₹4,200)',
    notes: 'Medical prescription and consultation billing',
    amount: 4200,
    category: 'Healthcare',
    date: '2026-05-25',
    data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  }
];

export default function ExpenseTracker({
  transactions,
  currencySymbol,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}: ExpenseTrackerProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All'); // 'All', 'Today', 'Week', 'Month'
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [notes, setNotes] = useState('');
  
  // OCR Vision states
  const [isCapturing, setIsCapturing] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState('');

  const categories = [
    'Food',
    'Shopping',
    'Transport',
    'Entertainment',
    'Education',
    'Healthcare',
    'Bills',
    'Investments',
    'Other'
  ];

  // AI Automatic Categorization Trigger
  const handleAiCategorize = async () => {
    if (!notes.trim()) {
      alert('Please type description notes first for the AI to classify!');
      return;
    }
    setOcrLoading(true);
    try {
      const response = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: notes })
      });
      const data = await response.json();
      if (data.success && data.category) {
        setCategory(data.category);
      } else {
        // Fallback local rules if API lacks keys
        alert('Gemini API is not fully loaded. Auto Categorized using local smart keywords.');
        const lower = notes.toLowerCase();
        if (lower.includes('eat') || lower.includes('food') || lower.includes('pizza') || lower.includes('coffee') || lower.includes('restaurant')) setCategory('Food');
        else if (lower.includes('amazon') || lower.includes('cloth') || lower.includes('buy') || lower.includes('bag') || lower.includes('shoes')) setCategory('Shopping');
        else if (lower.includes('uber') || lower.includes('taxi') || lower.includes('fuel') || lower.includes('metro') || lower.includes('bus')) setCategory('Transport');
        else if (lower.includes('movie') || lower.includes('netflix') || lower.includes('sub') || lower.includes('spotify') || lower.includes('game')) setCategory('Entertainment');
        else if (lower.includes('rent') || lower.includes('electricity') || lower.includes('bill') || lower.includes('water')) setCategory('Bills');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOcrLoading(false);
    }
  };

  // Simulated & Real OCR receipt helper
  const handleOcrTrigger = async (receipt: typeof sampleReceipts[0]) => {
    setOcrLoading(true);
    setOcrMessage('Machine Vision scanning receipt image bytes...');
    try {
      const response = await fetch('/api/ai/ocr-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image: receipt.data })
      });
      const resData = await response.json();
      if (resData.success && resData.data) {
        const { amount: ocrAmt, category: ocrCat, notes: ocrNotes, date: ocrDate } = resData.data;
        setAmount(ocrAmt.toString());
        setCategory(ocrCat || 'Other');
        setNotes(ocrNotes || '');
        if (ocrDate) setDate(ocrDate);
        setOcrMessage('Scan Complete! Core entries filled dynamically.');
        setTimeout(() => setOcrMessage(''), 3000);
      } else {
        // Fallback to pre-configured values if Gemini is missing
        setAmount(receipt.amount.toString());
        setCategory(receipt.category);
        setNotes(receipt.notes);
        setDate(receipt.date);
        setOcrMessage('Simulated Vision Complete (Offline Fallback). Fields prefilled.');
        setTimeout(() => setOcrMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOcrLoading(false);
    }
  };

  // Handle submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please file a valid positive amount.');
      return;
    }

    const payload = {
      amount: parseFloat(amount),
      type: 'expense' as const,
      category,
      date,
      paymentMethod,
      notes: notes.trim()
    };

    if (editingId) {
      onEditTransaction(editingId, payload);
      setEditingId(null);
    } else {
      onAddTransaction(payload);
    }

    // Reset Form
    setAmount('');
    setCategory('Food');
    setNotes('');
    setIsFormOpen(false);
  };

  const handleEditInit = (t: Transaction) => {
    setEditingId(t.id);
    setAmount(t.amount.toString());
    setCategory(t.category);
    setDate(t.date);
    setPaymentMethod(t.paymentMethod);
    setNotes(t.notes || '');
    setIsFormOpen(true);
  };

  // Filter & Sort core arithmetic logic
  const filteredExpenses = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense');

    return expenses
      .filter((t) => {
        const matchesSearch =
          (t.notes || '').toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase());

        const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;

        // Date logic
        let matchesDate = true;
        if (selectedDateFilter !== 'All') {
          const transDate = new Date(t.date);
          const today = new Date();
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(today.getDate() - 7);
          const oneMonthAgo = new Date();
          oneMonthAgo.setDate(today.getDate() - 30);

          if (selectedDateFilter === 'Today') {
            matchesDate = t.date === today.toISOString().split('T')[0];
          } else if (selectedDateFilter === 'Week') {
            matchesDate = transDate >= oneWeekAgo;
          } else if (selectedDateFilter === 'Month') {
            matchesDate = transDate >= oneMonthAgo;
          }
        }

        return matchesSearch && matchesCat && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, search, selectedCategory, selectedDateFilter, sortBy]);

  return (
    <div id="expense-ledger-panel" className="space-y-6 pb-12">
      
      {/* Top Ledger Header Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Expense Ledgers Hub</h1>
          <p className="text-xs text-gray-400 mt-0.5">Organize, review, filter, and upload receipts.</p>
        </div>

        <button
          id="btn-open-add-expense-form"
          onClick={() => {
            setEditingId(null);
            setAmount('');
            setNotes('');
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4.5 py-2.5 bg-zinc-900 dark:bg-zinc-800 text-white font-semibold text-sm rounded-xl hover:scale-[1.02] active:scale-95 transition shadow cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5 text-emerald-400" />
          <span>New Expense</span>
        </button>
      </div>

      {/* Floating Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850/80 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              {editingId ? 'Edit Register Entry' : 'Log New Expense'}
            </h3>
            <p className="text-xs text-gray-400 mb-5">Provide expense metrics of scan invoice receipt with AI.</p>

            {/* OCR Scanner Section */}
            <div className="mb-6 p-4 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                <Camera className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>AI Receipt Vision Scanner (OCR)</span>
              </div>
              <p className="text-xs text-gray-500 leading-snug">
                Pick a mock bill below to simulate a real receipt camera capture. Gemini reads details instantly:
              </p>
              
              <div className="flex flex-wrap gap-2 pt-1">
                {sampleReceipts.map((sr, i) => (
                  <button
                    key={i}
                    onClick={() => handleOcrTrigger(sr)}
                    className="px-2.5 py-1 text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-950/40 rounded-lg text-emerald-800 dark:text-emerald-300 transition shrink-0 cursor-pointer"
                  >
                    {sr.name}
                  </button>
                ))}
              </div>

              {ocrMessage && (
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3 h-3 anim-spin" />
                  <span>{ocrMessage}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-450 dark:text-zinc-600">{currencySymbol}</span>
                    <input
                      type="number"
                      required
                      step="any"
                      placeholder="500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-zinc-805 pl-7 pr-3 py-2.5 rounded-xl border border-gray-150 dark:border-zinc-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-805 px-3 py-2.5 rounded-xl border border-gray-150 dark:border-zinc-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Notes / Description</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="E.g., Groceries from hypermarket, taxi ride to doctor"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-805 pl-3 pr-10 py-2.5 rounded-xl border border-gray-150 dark:border-zinc-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  />
                  <button
                    type="button"
                    title="Auto categorize using Gemini"
                    onClick={handleAiCategorize}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 cursor-pointer"
                  >
                    <Sparkles className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-805 px-3 py-2 rounded-xl border border-gray-150 dark:border-zinc-800 text-sm font-semibold focus:outline-none"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Pay Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-805 px-3 py-2 rounded-xl border border-gray-150 dark:border-zinc-800 text-sm font-semibold focus:outline-none"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI / QR">UPI / QR</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              {ocrLoading && (
                <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center gap-2 text-xs text-emerald-600 font-semibold select-none">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                  <span>Processing with Gemini Model...</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 rounded-xl text-sm font-bold hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition shadow shadow-emerald-500/10 cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Log Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter and Search Utility Row */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search expense, bills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-805 pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-semibold focus:outline-none"
          />
        </div>

        {/* Categories, Dates, and Sort controls */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
          {/* Category drop */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-805 px-3 py-2 rounded-lg text-xs font-bold border border-slate-200 dark:border-zinc-800"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date range filter */}
          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="bg-slate-50 dark:bg-zinc-805 px-3 py-2 rounded-lg text-xs font-bold border border-slate-200 dark:border-zinc-800"
          >
            <option value="All">All Time</option>
            <option value="Today">Today Only</option>
            <option value="Week">Last 7 Days</option>
            <option value="Month">Last 30 Days</option>
          </select>

          {/* Sorting */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 dark:bg-zinc-805 px-3 py-2 rounded-lg text-xs font-bold border border-slate-200 dark:border-zinc-800"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Ledger Tables */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="p-4 pl-6">Ledger / Description</th>
                <th className="p-4">Category</th>
                <th className="p-4">Method</th>
                <th className="p-4">Execution Date</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 pr-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50 text-sm">
              {filteredExpenses.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-805/30 transition">
                  <td className="p-4 pl-6 font-semibold text-gray-800 dark:text-zinc-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100/50 dark:border-red-900/10 flex items-center justify-center font-black">
                        {t.category[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="block">{t.notes || t.category}</span>
                        <span className="text-[10px] text-gray-400 font-medium">TxID: #{t.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 text-xs font-bold">
                      {t.category}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 dark:text-zinc-400 text-xs font-semibold">
                    {t.paymentMethod}
                  </td>
                  <td className="p-4 text-gray-500 dark:text-zinc-400 text-xs font-medium flex items-center gap-1.5 py-6">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t.date}</span>
                  </td>
                  <td className="p-4 text-right font-extrabold text-gray-950 dark:text-white font-mono">
                    -{currencySymbol}{t.amount.toLocaleString()}
                  </td>
                  <td className="p-4 pr-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title="Edit log details"
                        onClick={() => handleEditInit(t)}
                        className="p-1.5 rounded bg-gray-50 dark:bg-zinc-800 text-gray-400 hover:text-gray-800 dark:hover:text-zinc-200 hover:scale-105 transition cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        title="Delete ledger entry"
                        onClick={() => onDeleteTransaction(t.id)}
                        className="p-1.5 rounded bg-red-50 dark:bg-red-950/10 text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:scale-105 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 dark:text-zinc-650">
                    <FileText className="w-12 h-12 stroke-1 mx-auto text-gray-200 mb-2" />
                    <p>No matching expenses found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
