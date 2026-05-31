import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Wallet,
  Activity,
  Award,
  BellRing,
  Plus,
  Compass,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Transaction, Budget, SavingGoal, UserProfile, UserNotification, Badge } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  savingGoals: SavingGoal[];
  user: UserProfile;
  notifications: UserNotification[];
  badges: Badge[];
  currencySymbol: string;
  onOpenQuickAdd: (type: 'income' | 'expense') => void;
  setActiveTab: (tab: string) => void;
  onClearNotification: (id: string) => void;
}

export default function Dashboard({
  transactions,
  budgets,
  savingGoals,
  user,
  notifications,
  badges,
  currencySymbol,
  onOpenQuickAdd,
  onClearNotification,
  setActiveTab
}: DashboardProps) {
  const [activeChartTab, setActiveChartTab] = useState<'category' | 'trends' | 'vs'>('category');

  // Compute stats
  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    const totalBalance = totalIncome - totalExpense;

    // Budget
    const totalBudget = budgets.reduce((acc, b) => acc + b.limit, 0);
    const totalBudgetSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
    const remainingBudget = Math.max(0, totalBudget - totalBudgetSpent);

    // Goal Savings
    const totalGoalSaved = savingGoals.reduce((acc, g) => acc + g.currentAmount, 0);

    return {
      balance: totalBalance,
      income: totalIncome,
      expense: totalExpense,
      goalsSaved: totalGoalSaved,
      remainingBudget,
      budgetSpentPercent: totalBudget > 0 ? (totalBudgetSpent / totalBudget) * 100 : 0
    };
  }, [transactions, budgets, savingGoals]);

  // Compute category chart data
  const categoryChartData = useMemo(() => {
    const categories: Record<string, number> = {};
    const expenses = transactions.filter((t) => t.type === 'expense');

    expenses.forEach((t) => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    const colors: Record<string, string> = {
      Food: '#10b981', // emerald-500
      Shopping: '#f59e0b', // amber-500
      Transport: '#3b82f6', // blue-500
      Entertainment: '#8b5cf6', // purple-500
      Education: '#6366f1', // indigo-500
      Healthcare: '#ef4444', // red-500
      Bills: '#ec4899', // pink-500
      Investments: '#14b8a6', // teal-500
      Other: '#6b7280' // gray-500
    };

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#9ca3af'
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Compute monthly trends chart data
  const monthlyTrends = useMemo(() => {
    // Generate simulated monthly log
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = months.map((month, index) => {
      // Scale based on actual values
      const factor = (index + 1) / 6;
      return {
        month,
        income: Math.round((stats.income || 50000) * (0.7 + factor * 0.4)),
        expense: Math.round((stats.expense || 25000) * (0.6 + factor * 0.3))
      };
    });
    return data;
  }, [stats]);

  // Calculate Financial Health Score (out of 100)
  const healthScore = useMemo(() => {
    let score = 50;

    // 1. Savings rate (Income - Expense) / Income
    if (stats.income > 0) {
      const savingsRate = (stats.income - stats.expense) / stats.income;
      if (savingsRate > 0.4) score += 20;
      else if (savingsRate > 0.2) score += 15;
      else if (savingsRate > 0) score += 10;
      else score -= 10;
    }

    // 2. Budget adherence
    if (stats.budgetSpentPercent > 0) {
      if (stats.budgetSpentPercent < 80) score += 15;
      else if (stats.budgetSpentPercent <= 100) score += 10;
      else score -= 15;
    } else {
      score += 15; // default if no budget limits configured
    }

    // 3. Goal tracking
    const goalsCount = savingGoals.length;
    if (goalsCount > 0) {
      const completionRate = savingGoals.reduce((acc, g) => acc + (g.currentAmount / g.targetAmount), 0) / goalsCount;
      score += Math.round(completionRate * 15);
    } else {
      score += 5;
    }

    // Boundary rules
    return Math.max(10, Math.min(100, score));
  }, [stats, savingGoals]);

  const healthLevel = useMemo(() => {
    if (healthScore >= 80) return { label: 'Excellent', text: 'You are in prime financial shape! Your budgeting and savings habits are stellar.', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30' };
    if (healthScore >= 60) return { label: 'Healthy', text: 'Great progress. Consider fine-tuning your recurring bills or reducing entertainment spent.', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30' };
    if (healthScore >= 40) return { label: 'Fair', text: 'On track but slightly high expenditure. Set stricter budgets for food and shopping.', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30' };
    return { label: 'Critical Alert', text: 'Expense ratios are high compared to income streams. Consult MoneyMate AI for optimization.', color: 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30' };
  }, [healthScore]);

  // Streak Rewards system
  const streakChallenge = {
    title: 'Financial Fitness Streak',
    description: 'Keep logging transactions daily to maintain your XP level!',
    progress: user.dailyStreak,
    target: 10,
    xpMultiplier: 2.5
  };

  return (
    <div id="dashboard-wrapper-panel" className="space-y-8 pb-12">
      {/* Welcome Heading Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            Hello, {user.name.split(' ')[0]}! <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">
            Track, save, and optimize. Here is your automated wealth overview for today.
          </p>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-3">
          <button
            id="quick-add-income"
            onClick={() => onOpenQuickAdd('income')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Income</span>
          </button>
          <button
            id="quick-add-expense"
            onClick={() => onOpenQuickAdd('expense')}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* Notifications Bar */}
      {notifications.length > 0 && (
        <div id="unread-notifications-container" className="space-y-2">
          {notifications.slice(0, 2).map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border flex items-start gap-3 transition ${
                notif.type === 'success'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/15 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                  : notif.type === 'warning'
                    ? 'bg-amber-50/70 dark:bg-amber-950/15 border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300'
                    : 'bg-blue-50/70 dark:bg-blue-950/15 border-blue-100 dark:border-blue-900/30 text-blue-800 dark:text-blue-300'
              }`}
            >
              {notif.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
              ) : (
                <BellRing className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
              )}
              <div className="flex-1 text-sm">
                <span className="font-semibold block">{notif.title}</span>
                <p className="opacity-90 mt-0.5">{notif.message}</p>
              </div>
              <button
                onClick={() => onClearNotification(notif.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 text-xs font-semibold px-2 py-1 rounded cursor-pointer"
              >
                Clear
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Financial Overview Bento Grid */}
      <div id="stats-dashboard-bento" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Net Balance */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 p-6 bg-slate-50 dark:bg-zinc-800/10 rounded-full text-emerald-500">
            <Wallet className="w-10 h-10 opacity-20" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Net Balance</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block select-all">
              {currencySymbol}{stats.balance.toLocaleString()}
            </h3>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active Funds</span>
          </p>
        </div>

        {/* Monthly Income */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Total Income</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block select-all">
              {currencySymbol}{stats.income.toLocaleString()}
            </h3>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cash Inflows</span>
          </p>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Total Outflow</span>
            <h3 className="text-xl font-extrabold text-rose-500 mt-1 block select-all">
              {currencySymbol}{stats.expense.toLocaleString()}
            </h3>
          </div>
          <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1 mt-3">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Outflow</span>
          </p>
        </div>

        {/* Goal Savings */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Goal Savings</span>
            <h3 className="text-xl font-extrabold text-emerald-500 mt-1 block select-all">
              {currencySymbol}{stats.goalsSaved.toLocaleString()}
            </h3>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-3">
            <Percent className="w-3.5 h-3.5" />
            <span>Locked Safety</span>
          </p>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Free Budget</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block select-all font-mono">
              {currencySymbol}{stats.remainingBudget.toLocaleString()}
            </h3>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, stats.budgetSpentPercent)}%` }}
              ></div>
            </div>
            <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold mt-1 uppercase tracking-wider">
              Spent: {Math.max(0, Math.round(stats.budgetSpentPercent))}%
            </p>
          </div>
        </div>

      </div>

      {/* Main Panel Content: Analytics & Charts */}
      <div id="analytics-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Graphs Container */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm">
          {/* Chart Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-zinc-850">
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Financial Analytics & Trends</h3>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">Visualize category allocations and monthly projections.</p>
            </div>
            <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveChartTab('category')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeChartTab === 'category'
                    ? 'bg-white dark:bg-zinc-950 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-zinc-400'
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => setActiveChartTab('trends')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeChartTab === 'trends'
                    ? 'bg-white dark:bg-zinc-950 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-zinc-400'
                }`}
              >
                Spending trends
              </button>
              <button
                onClick={() => setActiveChartTab('vs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeChartTab === 'vs'
                    ? 'bg-white dark:bg-zinc-950 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-zinc-400'
                }`}
              >
                Cashflows
              </button>
            </div>
          </div>

          {/* Render active chart */}
          <div className="h-72 flex items-center justify-center relative">
            
            {activeChartTab === 'category' && (
              categoryChartData.length === 0 ? (
                <div className="text-center text-gray-400 dark:text-zinc-600">
                  <Compass className="w-12 h-12 mx-auto stroke-1 mb-2 text-gray-300" />
                  <p className="text-sm">No expenses logged yet.</p>
                  <button
                    onClick={() => onOpenQuickAdd('expense')}
                    className="text-xs font-bold text-emerald-500 hover:underline mt-1 cursor-pointer"
                  >
                    Add one here
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col sm:flex-row items-center justify-around gap-6">
                  {/* SVG Donut Chart */}
                  <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#f3f4f6"
                        strokeWidth="12"
                        fill="transparent"
                        className="dark:stroke-zinc-800"
                      />
                      {/* Sub-slices */}
                      {(() => {
                        let accumPercent = 0;
                        const totalCategoryVal = categoryChartData.reduce((acc, c) => acc + c.value, 0);

                        return categoryChartData.map((item, id) => {
                          const percent = (item.value / totalCategoryVal) * 100;
                          const strokeDashArray = `${percent} ${100 - percent}`;
                          const strokeDashOffset = 100 - accumPercent + 25; // Shift to top starting coordinate
                          accumPercent += percent;

                          return (
                            <circle
                              key={id}
                              cx="50"
                              cy="50"
                              r="38"
                              stroke={item.color}
                              strokeWidth="12"
                              strokeDasharray={strokeDashArray}
                              strokeDashoffset={strokeDashOffset}
                              pathLength="100"
                              fill="transparent"
                              className="transition-all duration-300 hover:stroke-[14px]"
                            />
                          );
                        });
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wide">EXPENSES</span>
                      <span className="text-sm font-extrabold text-gray-800 dark:text-white block mt-0.5">
                        {currencySymbol}{categoryChartData.reduce((acc, c) => acc + c.value, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Legends */}
                  <div className="flex-1 space-y-1.5 overflow-y-auto max-h-64 pr-2">
                    {categoryChartData.slice(0, 6).map((item, index) => {
                      const totalItemVal = categoryChartData.reduce((acc, c) => acc + c.value, 0);
                      const fraction = totalItemVal > 0 ? (item.value / totalItemVal) * 100 : 0;
                      return (
                        <div key={index} className="flex items-center justify-between text-xs p-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }}></span>
                            <span className="font-medium text-gray-700 dark:text-zinc-300">{item.name}</span>
                          </div>
                          <div className="font-semibold text-gray-800 dark:text-white font-mono shrink-0">
                            {currencySymbol}{item.value.toLocaleString()} <span className="text-gray-400 dark:text-zinc-600 text-[10px]">({Math.round(fraction)}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}

            {activeChartTab === 'trends' && (
              <div className="w-full h-full flex flex-col justify-end pt-4">
                <div className="flex items-end justify-between h-56 gap-4 px-2 select-none">
                  {monthlyTrends.map((trend, i) => {
                    const maxVal = Math.max(...monthlyTrends.map((t) => t.expense), 5000);
                    const barHeight = `${(trend.expense / maxVal) * 85}%`;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 bg-gray-900 border border-zinc-800 text-white text-[10px] px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition duration-150 z-20 pointer-events-none whitespace-nowrap">
                          Rent/Spent: {currencySymbol}{trend.expense.toLocaleString()}
                        </div>
                        {/* Interactive Bar */}
                        <div className="w-full bg-gray-100 dark:bg-zinc-800 h-44 rounded-xl flex items-end overflow-hidden">
                          <div
                            className="bg-emerald-500 dark:bg-emerald-600 w-full rounded-t-xl group-hover:bg-emerald-400 transition-all duration-300"
                            style={{ height: barHeight }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-500 mt-2">{trend.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeChartTab === 'vs' && (
              <div className="w-full h-full flex flex-col justify-end pt-4">
                {/* SVG Line / Bar Chart visualizer */}
                <div className="flex items-end justify-between h-56 gap-6 px-2">
                  {monthlyTrends.map((trend, i) => {
                    const maxVal = Math.max(...monthlyTrends.map((t) => Math.max(t.income, t.expense)), 10000);
                    const incHeight = `${(trend.income / maxVal) * 85}%`;
                    const expHeight = `${(trend.expense / maxVal) * 85}%`;

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center relative group">
                        {/* Double cluster bar */}
                        <div className="w-full h-44 flex items-end gap-1.5">
                          {/* Income column */}
                          <div className="flex-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-t h-full flex items-end justify-center">
                            <div className="w-full bg-emerald-500 rounded-t transition-all duration-300" style={{ height: incHeight }}></div>
                          </div>
                          {/* Expense column */}
                          <div className="flex-1 bg-red-100 dark:bg-red-900/20 rounded-t h-full flex items-end justify-center">
                            <div className="w-full bg-rose-500 rounded-t transition-all duration-300" style={{ height: expHeight }}></div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-650 mt-2 block">{trend.month}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Visual indicator notes */}
                <div className="flex justify-center items-center gap-4 text-[10px] text-gray-400 dark:text-zinc-500 mt-3 font-semibold">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-emerald-500"></span>
                    <span>Monthly Income</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-rose-500"></span>
                    <span>Monthly Spend</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Side Widgets: Score & Level Gamification */}
        <div className="space-y-6">
          
          {/* Health index dials */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              <span>Financial Health Index</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Automated safety diagnosis.</p>

            <div className="flex flex-col items-center justify-center mt-6">
              {/* Dial Gauge */}
              <div className="relative w-36 h-20 overflow-hidden flex items-end justify-center">
                <svg className="w-full h-full transform" viewBox="0 0 100 50">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#f3f4f6"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray="125.6"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    className="dark:stroke-zinc-800"
                  />
                  {/* Gauge Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={healthScore >= 75 ? '#10b981' : healthScore >= 50 ? '#3b82f6' : healthScore >= 35 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 - (healthScore / 100) * 125.6}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute bottom-0 text-center">
                  <span className="text-3xl font-extrabold text-gray-800 dark:text-white block font-mono">
                    {healthScore}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider">HEALTH RATE</span>
                </div>
              </div>

              {/* Status banner */}
              <div className={`p-3.5 rounded-xl border text-xs mt-4 font-medium transition ${healthLevel.color}`}>
                <div className="flex items-center gap-1 px-1">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-bold uppercase tracking-wider">{healthLevel.label} Rating</span>
                </div>
                <p className="opacity-90 mt-1.5 px-1 leading-relaxed">
                  {healthLevel.text}
                </p>
              </div>
            </div>
          </div>

          {/* Gamification Level, Streak Challenge */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500 animate-pulse" />
              <span>Level Rewards & Achievements</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Maintain consistent habits to level up!</p>

            <div className="space-y-4 mt-5">
              {/* LVL tracker */}
              <div className="bg-gray-50 dark:bg-zinc-800/40 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400">CURRENT STANDING</span>
                  <p className="font-extrabold text-lg text-gray-800 dark:text-white">Savings Recruit</p>
                </div>
                <div className="bg-orange-500 text-white font-black px-3.5 py-1.5 rounded-xl text-sm">
                  Lvl {user.level}
                </div>
              </div>

              {/* XP progress */}
              <div className="text-xs">
                <div className="flex justify-between font-bold text-gray-500 mb-1">
                  <span>Level XP Progress</span>
                  <span>{user.xp} / 500 XP</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${(user.xp / 500) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Daily challenge log */}
              <div className="border border-dashed border-gray-200 dark:border-zinc-800/80 p-3.5 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span className="font-bold text-gray-700 dark:text-zinc-300">Daily Spending Streak</span>
                  </div>
                  <span className="font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded">
                    +{streakChallenge.xpMultiplier}x XP
                  </span>
                </div>
                <p className="text-gray-400 leading-snug">{streakChallenge.description}</p>
                <div className="flex items-center gap-1.5 font-bold pt-1 text-gray-600 dark:text-zinc-400">
                  <div className="flex-1 bg-gray-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500"
                      style={{ width: `${(streakChallenge.progress / streakChallenge.target) * 100}%` }}
                    ></div>
                  </div>
                  <span>{streakChallenge.progress}/{streakChallenge.target} days</span>
                </div>
              </div>

              {/* Badge shelf view */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Unlocked Badges</h4>
                <div className="flex gap-2 overflow-x-auto pb-1 select-none">
                  {badges.filter((b) => b.unlocked).slice(0, 4).map((badge) => (
                    <div
                      key={badge.id}
                      className="p-2 shrink-0 bg-emerald-50 hover:bg-emerald-100/70 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30 rounded-lg flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-400 border border-emerald-100/40 transition"
                      title={badge.description}
                    >
                      <Award className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                      <span>{badge.name}</span>
                    </div>
                  ))}
                  {badges.filter((b) => b.unlocked).length === 0 && (
                    <span className="text-xs text-gray-300">Keep logging to acquire badges!</span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Historic Logs Quick Overview Router */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-zinc-850">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Recent Ledgers Logged</h3>
            <p className="text-xs text-gray-400">Quick list of recent inflows and outflows.</p>
          </div>
          <button
            onClick={() => setActiveTab('expenses')}
            className="text-xs font-bold text-emerald-500 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Complete ledger archives</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-zinc-800/50">
          {transactions.slice(0, 4).map((t) => (
            <div key={t.id} className="flex justify-between items-center py-3.5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border font-bold ${
                    t.type === 'income'
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                      : 'bg-rose-50 dark:bg-rose-950/20 text-rose-650 dark:text-rose-400 border-rose-100 dark:border-rose-900/20'
                  }`}
                >
                  {t.category[0].toUpperCase()}
                </div>
                <div>
                  <h5 className="font-semibold text-sm text-gray-800 dark:text-zinc-200">
                    {t.notes || t.category}
                  </h5>
                  <div className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium flex items-center gap-1.5 mt-0.5">
                    <span>{t.category}</span>
                    <span>•</span>
                    <span>{t.date}</span>
                    <span>•</span>
                    <span>{t.paymentMethod}</span>
                  </div>
                </div>
              </div>
              <span
                className={`font-extrabold text-sm font-mono ${
                  t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-white'
                }`}
              >
                {t.type === 'income' ? '+' : '-'}{currencySymbol}{t.amount.toLocaleString()}
              </span>
            </div>
          ))}

          {transactions.length === 0 && (
            <div className="text-center py-8 text-gray-400 dark:text-zinc-650">
              No transactions logged yet. Let's register your first inflow!
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
