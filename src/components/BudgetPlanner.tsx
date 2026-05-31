import React, { useState } from 'react';
import {
  Wallet,
  Coins,
  Edit2,
  AlertTriangle,
  CheckCircle,
  Plus,
  Scale
} from 'lucide-react';
import { Budget } from '../types';

interface BudgetPlannerProps {
  budgets: Budget[];
  currencySymbol: string;
  onSetBudgetLimit: (category: string, limit: number) => void;
  expenses: { category: string; amount: number }[];
}

export default function BudgetPlanner({
  budgets,
  currencySymbol,
  onSetBudgetLimit,
}: BudgetPlannerProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState('');

  const handleEditClick = (b: Budget) => {
    setEditingCategory(b.category);
    setLimitInput(b.limit.toString());
  };

  const handleSave = (category: string) => {
    const val = parseFloat(limitInput);
    if (isNaN(val) || val < 0) {
      alert('Please type a valid budget limit amount.');
      return;
    }
    onSetBudgetLimit(category, val);
    setEditingCategory(null);
  };

  // Compute stats
  const aggregateLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const aggregateSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const globalProgress = aggregateLimit > 0 ? (aggregateSpent / aggregateLimit) * 100 : 0;

  return (
    <div id="budget-planner-dashboard" className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Budget Planner & Safety Limits</h1>
        <p className="text-xs text-gray-400 mt-0.5">Define category limits. Automatically alerts you when spending goes above thresholds.</p>
      </div>

      {/* Global aggregated budget card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Agg limit info */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-805 p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">Aggregated Limits Cap</span>
            <span className="text-xl font-bold text-gray-800 dark:text-white font-mono mt-1 block">
              {currencySymbol}{aggregateLimit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Agg spent info */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-805 p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-xl">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">Current Aggregate Spent</span>
            <span className="text-xl font-bold text-gray-800 dark:text-white font-mono mt-1 block">
              {currencySymbol}{aggregateSpent.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Risk profile */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-805 p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/15 text-blue-500 rounded-xl">
            <Scale className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs text-gray-400 font-bold block">Wallet Consumption Status</span>
            <div className="w-full bg-gray-155 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  globalProgress > 95 ? 'bg-red-500' : globalProgress > 75 ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, globalProgress)}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-gray-400 block mt-1 font-semibold">
              Consumed: {Math.round(globalProgress)}% of bounds
            </span>
          </div>
        </div>

      </div>

      {/* Category Budget Breakdown List Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-805 rounded-xl p-5 shadow-sm space-y-6">
        <div>
          <h3 className="font-bold text-gray-800 dark:text-white">Active Category Allowances</h3>
          <p className="text-xs text-gray-450">Change category limits and view precise real-time progress bars.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((b) => {
            const hasExceeded = b.spent > b.limit;
            const isApproaching = b.spent >= b.limit * 0.8 && b.spent <= b.limit;
            const percent = b.limit > 0 ? (b.spent / b.limit) * 100 : 0;
            const isEditing = editingCategory === b.category;

            return (
              <div
                key={b.category}
                className={`p-4 rounded-xl border transition duration-150 ${
                  hasExceeded
                    ? 'bg-red-50/20 dark:bg-red-950/5 border-red-100 dark:border-red-900/10'
                    : isApproaching
                      ? 'bg-amber-50/20 dark:bg-amber-950/5 border-amber-100 dark:border-amber-900/10'
                      : 'bg-glass dark:bg-zinc-800/10 border-slate-200 dark:border-zinc-800/80 hover:border-slate-300'
                }`}
              >
                {/* Header info */}
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 dark:text-zinc-200">{b.category} Budget</h4>
                    {/* Exceed warning badges */}
                    <div className="mt-1 flex flex-wrap gap-2.5">
                      {hasExceeded ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-[10px] font-black uppercase">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Strictly Exceeded!</span>
                        </span>
                      ) : isApproaching ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 animate-bounce" />
                          <span>Approaching Limit (⚠️ {Math.round(percent)}%)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase">
                          <CheckCircle className="w-3 h-3 shrink-0" />
                          <span>Within Bounds</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Limit input / edit buttons */}
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{currencySymbol}</span>
                        <input
                          type="number"
                          value={limitInput}
                          onChange={(e) => setLimitInput(e.target.value)}
                          className="w-24 bg-white dark:bg-zinc-950 pl-5 pr-1 py-1 text-xs font-bold rounded-lg border border-gray-200 focus:outline-none"
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={() => handleSave(b.category)}
                        className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-extrabold rounded-lg cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditClick(b)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-gray-800 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Progress Visual */}
                <div className="space-y-1.5 mt-4">
                  <div className="w-full bg-gray-150 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        hasExceeded ? 'bg-red-500' : isApproaching ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-400 font-semibold font-mono">
                    <span>Spent: {currencySymbol}{b.spent.toLocaleString()}</span>
                    <span>Cap: {currencySymbol}{b.limit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
