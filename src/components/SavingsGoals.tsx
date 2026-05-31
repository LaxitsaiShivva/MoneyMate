import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Calendar,
  X,
  Target,
  Trophy,
  PiggyBank,
  TrendingUp,
  Award
} from 'lucide-react';
import { SavingGoal } from '../types';

interface SavingsGoalsProps {
  savingGoals: SavingGoal[];
  currencySymbol: string;
  onAddGoal: (g: Omit<SavingGoal, 'id' | 'completed'>) => void;
  onDeleteGoal: (id: string) => void;
  onContributeGoal: (id: string, amount: number) => void;
}

export default function SavingsGoals({
  savingGoals,
  currencySymbol,
  onAddGoal,
  onDeleteGoal,
  onContributeGoal,
}: SavingsGoalsProps) {
  // Goal modal creation form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  // Contribution controls
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [allocationAmount, setAllocationAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tAmt = parseFloat(targetAmount);
    const cAmt = parseFloat(currentAmount || '0');

    if (!goalName || isNaN(tAmt) || tAmt <= 0) {
      alert('Provide a valid goal name and positive target amount details!');
      return;
    }

    onAddGoal({
      name: goalName.trim(),
      targetAmount: tAmt,
      currentAmount: Math.max(0, cAmt),
      targetDate: targetDate || new Date().toISOString().split('T')[0]
    });

    // Reset Goal Form
    setGoalName('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setIsFormOpen(false);
  };

  const handleContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(allocationAmount);
    if (isNaN(amount) || amount <= 0 || !selectedGoalId) {
      alert('Type a valid contribution amount.');
      return;
    }
    onContributeGoal(selectedGoalId, amount);
    setAllocationAmount('');
    setSelectedGoalId(null);
  };

  return (
    <div id="savings-goals-panel" className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Savings & Vision Boards</h1>
          <p className="text-xs text-gray-400 mt-0.5">Define milestones, save systematically, and watch your targets complete.</p>
        </div>

        <button
          id="btn-open-goal-form"
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center gap-2 px-4.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl transition shadow active:scale-95 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Set New Goal</span>
        </button>
      </div>

      {/* Goal creation modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-gray-50 cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Set Savings Milestone</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Goal Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Buy MacBook, Emergency safety chest, Hawaii flight ticket"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-805 px-3 py-2.5 rounded-xl border border-gray-150 dark:border-zinc-850 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Target Amount */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Target Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">{currencySymbol}</span>
                    <input
                      type="number"
                      required
                      placeholder="80000"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-zinc-805 pl-7 pr-3 py-2 rounded-xl border border-gray-150 dark:border-zinc-850 text-sm font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Current Savings */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Initial Saved</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">{currencySymbol}</span>
                    <input
                      type="number"
                      placeholder="15000"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-zinc-805 pl-7 pr-3 py-2 rounded-xl border border-gray-150 dark:border-zinc-850 text-sm font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Target Date */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Target Deadline Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-805 px-3 py-2 rounded-xl border border-gray-150 dark:border-zinc-850 text-sm font-semibold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-500 font-bold rounded-xl text-sm hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-500 text-white font-bold rounded-xl text-sm hover:bg-emerald-600 transition"
                >
                  Launch Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Target Allocation contribution modal */}
      {selectedGoalId && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-gray-155 p-6 rounded-2xl w-full max-w-xs shadow-2xl relative">
            <button
              onClick={() => setSelectedGoalId(null)}
              className="absolute top-4 right-4 p-1 rounded text-gray-400 hover:bg-gray-50 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-3">Contribute Savings</h3>
            <p className="text-xs text-gray-400 mb-4">Allocate direct cash into this milestone jar:</p>

            <form onSubmit={handleContributeSubmit} className="space-y-4">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-450">{currencySymbol}</span>
                <input
                  type="number"
                  required
                  placeholder="5000"
                  value={allocationAmount}
                  onChange={(e) => setAllocationAmount(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-805 pl-7 pr-3 py-2 rounded-xl border border-gray-150 text-sm font-extrabold focus:outline-none"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl transition"
              >
                Transfer Funds
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Grid structure details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savingGoals.map((g) => {
          const percent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
          const isDone = g.completed || percent >= 100;

          return (
            <div
              key={g.id}
              className={`bg-white dark:bg-zinc-900 border p-4 rounded-xl flex flex-col justify-between shadow-sm transition duration-150 ${
                isDone
                  ? 'border-emerald-300 dark:border-emerald-950/25 bg-emerald-50/10 dark:bg-emerald-950/5'
                  : 'border-slate-200 dark:border-zinc-800'
              }`}
            >
              <div>
                {/* Goal header */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'}`}>
                      <Target className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-800 dark:text-zinc-200">{g.name}</h4>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>Deadline: {g.targetDate}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteGoal(g.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded bg-gray-50 dark:bg-zinc-850 hover:bg-red-50/50 cursor-pointer"
                    title="Delete goal milestone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Goal Progress metrics */}
                <div className="space-y-2.5 mt-5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-400 uppercase tracking-wider text-[10px]">CURRENT SAVED</span>
                    <span className="text-gray-900 dark:text-white font-mono">{percent}%</span>
                  </div>

                  {/* Range visual bar */}
                  <div className="w-full bg-gray-100 dark:bg-zinc-850 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${isDone ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between font-bold text-xs text-gray-600 dark:text-zinc-400">
                    <span className="font-mono">{currencySymbol}{g.currentAmount.toLocaleString()}</span>
                    <span className="font-mono text-gray-400">Target: {currencySymbol}{g.targetAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Contribute actions list */}
              <div className="mt-6 pt-4 border-t border-gray-50 dark:border-zinc-850/50">
                {isDone ? (
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 uppercase select-none">
                    <Trophy className="w-4 h-4 text-emerald-600 animate-bounce" />
                    <span>MILESTONE HIT!</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedGoalId(g.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 rounded-xl text-xs font-bold text-gray-700 dark:text-zinc-350 transition cursor-pointer"
                  >
                    <PiggyBank className="w-4 h-4 text-emerald-500" />
                    <span>Contribute systematic savings</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}

        {savingGoals.length === 0 && (
          <div className="col-span-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-12 text-center rounded-xl shadow-sm text-gray-400">
            <PiggyBank className="w-12 h-12 stroke-1 mx-auto text-gray-300 mb-2" />
            <span className="block text-sm font-semibold text-gray-500">No milestone goals set yet.</span>
            <p className="text-xs text-gray-300 max-w-xs mx-auto mt-1 leading-relaxed">Goals help focus your budget and automatically categorize surplus accounts to grow.</p>
          </div>
        )}
      </div>
    </div>
  );
}
