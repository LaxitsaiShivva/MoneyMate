import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Calendar,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Transaction } from '../types';

interface IncomeTrackerProps {
  transactions: Transaction[];
  currencySymbol: string;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onEditTransaction: (id: string, t: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
}

export default function IncomeTracker({
  transactions,
  currencySymbol,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}: IncomeTrackerProps) {
  // Form modal controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Salary');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Direct Deposit');
  const [notes, setNotes] = useState('');

  const incomeCategories = [
    'Salary',
    'Freelancing',
    'Business',
    'Investment Returns',
    'Gifts',
    'Other'
  ];

  const filteredIncomes = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Enter a valid incoming amount.');
      return;
    }

    const payload = {
      amount: parseFloat(amount),
      type: 'income' as const,
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

    setAmount('');
    setCategory('Salary');
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

  return (
    <div id="income-tracker-panel" className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Income Sources Registry</h1>
          <p className="text-xs text-gray-400 mt-0.5">Track, audit, and log multiple incoming cashflow streams.</p>
        </div>

        <button
          id="btn-add-income-top"
          onClick={() => {
            setEditingId(null);
            setAmount('');
            setNotes('');
            setCategory('Salary');
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold text-sm rounded-xl transition shadow cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>New Income</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
              {editingId ? 'Edit Cashflow Record' : 'Log Income Cashflow'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Incoming Amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400">{currencySymbol}</span>
                  <input
                    type="number"
                    required
                    step="any"
                    placeholder="35000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-805 pl-7 pr-3 py-2.5 rounded-xl border border-gray-150 dark:border-zinc-800 text-sm font-semibold focus:ring-2 focus:ring-emerald-400/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Source Stream</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-805 px-3 py-2.5 rounded-xl border border-gray-150 dark:border-zinc-800 text-sm font-semibold focus:outline-none"
                >
                  {incomeCategories.map((ic) => (
                    <option key={ic} value={ic}>{ic}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Description / Notes</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Monthly Salary, Freelance project payout"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-805 px-3 py-2.5 rounded-xl border border-gray-150 dark:border-zinc-800 text-sm font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Inflow Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-805 px-3 py-2 rounded-xl border border-gray-150 dark:border-zinc-800 text-sm font-semibold focus:outline-none"
                  />
                </div>

                {/* Entry Payee details */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-805 px-3 py-2 rounded-xl border border-gray-150 dark:border-zinc-800 text-sm font-semibold focus:outline-none"
                  >
                    <option value="Direct Deposit">Direct Deposit</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 rounded-xl text-sm font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition shadow"
                >
                  {editingId ? 'Edit Stream' : 'Register Stream'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Income Records Grid lists */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-805 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
              <th className="p-4 pl-6">Source / Payee</th>
              <th className="p-4">Type</th>
              <th className="p-4">Deposit Channel</th>
              <th className="p-4">Receipt Date</th>
              <th className="p-4 text-right">Inflow Value</th>
              <th className="p-4 pr-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50 text-sm">
            {filteredIncomes.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-805/30 transition">
                <td className="p-4 pl-6 font-semibold text-gray-800 dark:text-zinc-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-100/50 dark:border-emerald-900/10 flex items-center justify-center font-black">
                      {t.category[0].toUpperCase()}
                    </div>
                    <div>
                      <span>{t.notes || t.category}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    {t.category}
                  </span>
                </td>
                <td className="p-4 text-gray-500 dark:text-zinc-400 text-xs font-semibold">
                  {t.paymentMethod}
                </td>
                <td className="p-4 text-gray-500 dark:text-zinc-400 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{t.date}</span>
                  </div>
                </td>
                <td className="p-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  +{currencySymbol}{t.amount.toLocaleString()}
                </td>
                <td className="p-4 pr-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEditInit(t)}
                      className="p-1.5 rounded bg-gray-50 dark:bg-zinc-800 text-gray-400 hover:text-gray-800 hover:scale-105 transition cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTransaction(t.id)}
                      className="p-1.5 rounded bg-red-50 dark:bg-red-950/10 text-red-400 hover:text-red-600 hover:scale-105 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredIncomes.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400 dark:text-zinc-650">
                  <FileSpreadsheet className="w-12 h-12 stroke-1 mx-auto text-gray-200 mb-2" />
                  <p>No active income sources recorded.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
