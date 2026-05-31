import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  X,
  Share2,
  DollarSign,
  TrendingUp,
  Activity,
  UserCheck,
  Percent,
  TrendingDown,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { SplitExpense, Debt, Investment } from '../types';

interface PremiumFeaturesProps {
  splitExpenses: SplitExpense[];
  debts: Debt[];
  investments: Investment[];
  currencySymbol: string;
  onAddSplitExpense: (se: Omit<SplitExpense, 'id'>) => void;
  onAddDebt: (d: Omit<Debt, 'id' | 'settled'>) => void;
  onSettleDebt: (id: string) => void;
  onAddInvestment: (i: Omit<Investment, 'id'>) => void;
  onUpdateInvestment: (id: string, currentVal: number) => void;
}

export default function PremiumFeatures({
  splitExpenses,
  debts,
  investments,
  currencySymbol,
  onAddSplitExpense,
  onAddDebt,
  onSettleDebt,
  onAddInvestment,
  onUpdateInvestment
}: PremiumFeaturesProps) {
  const [activeSubTab, setActiveSubTab] = useState<'split' | 'debts' | 'investments'>('split');

  // Form states - Split Expense
  const [splitDesc, setSplitDesc] = useState('');
  const [splitTotal, setSplitTotal] = useState('');
  const [friendName, setFriendName] = useState('');
  const [friendList, setFriendList] = useState<{ name: string; amount: number; settled: boolean }[]>([]);

  // Form states - Debts
  const [isDebtFormOpen, setIsDebtFormOpen] = useState(false);
  const [debtType, setDebtType] = useState<'lent' | 'borrowed'>('lent');
  const [debtParty, setDebtParty] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtDueDate, setDebtDueDate] = useState('');
  const [debtNotes, setDebtNotes] = useState('');

  // Form states - Investments
  const [isInvFormOpen, setIsInvFormOpen] = useState(false);
  const [invName, setInvName] = useState('');
  const [invType, setInvType] = useState<'stocks' | 'mutual_funds' | 'sip' | 'fixed_deposits' | 'crypto'>('stocks');
  const [invPrincipal, setInvPrincipal] = useState('');
  const [invCurrent, setInvCurrent] = useState('');

  // Helper variables
  const handleAddFriendToSplit = () => {
    if (!friendName.trim()) return;
    setFriendList([...friendList, { name: friendName.trim(), amount: 0, settled: false }]);
    setFriendName('');
  };

  const handleCreateSplit = () => {
    const total = parseFloat(splitTotal);
    if (!splitDesc || isNaN(total) || total <= 0) {
      alert('Provide description and positive total bill.');
      return;
    }
    const participantCount = friendList.length + 1; // friends + self
    const equalShare = total / participantCount;

    const formattedFriends = friendList.map((f) => ({
      ...f,
      amount: equalShare,
      settled: false
    }));

    onAddSplitExpense({
      description: splitDesc.trim(),
      totalAmount: total,
      paidBy: 'You',
      friends: formattedFriends,
      date: new Date().toISOString().split('T')[0]
    });

    // Reset Split Form
    setSplitDesc('');
    setSplitTotal('');
    setFriendList([]);
  };

  // Debt submit
  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(debtAmount);
    if (!debtParty || isNaN(amt) || amt <= 0) {
      alert('Provide valid debt parameters.');
      return;
    }
    onAddDebt({
      type: debtType,
      party: debtParty.trim(),
      amount: amt,
      dueDate: debtDueDate || new Date().toISOString().split('T')[0],
      notes: debtNotes.trim()
    });
    setDebtParty('');
    setDebtAmount('');
    setDebtNotes('');
    setIsDebtFormOpen(false);
  };

  // Investment submit
  const handleCreateInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    const princ = parseFloat(invPrincipal);
    const curr = parseFloat(invCurrent || invPrincipal);
    if (!invName || isNaN(princ) || princ <= 0) {
      alert('Provide primary investment bounds.');
      return;
    }
    onAddInvestment({
      name: invName.trim(),
      type: invType,
      principalAmount: princ,
      currentValue: curr,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
    setInvName('');
    setInvPrincipal('');
    setInvCurrent('');
    setIsInvFormOpen(false);
  };

  // ROI computations
  const totalPrincipal = investments.reduce((acc, i) => acc + i.principalAmount, 0);
  const totalValue = investments.reduce((acc, i) => acc + i.currentValue, 0);
  const roiVal = totalValue - totalPrincipal;
  const roiPct = totalPrincipal > 0 ? (roiVal / totalPrincipal) * 100 : 0;

  return (
    <div id="premium-features-hub" className="space-y-6 pb-12">
      {/* Tab select banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6.5 h-6.5 text-emerald-500 fill-emerald-500/10" />
            <span>MoneyMate Premium Suite</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Unlock bill-splitting, SIP portfolios, and automated debt logs.</p>
        </div>

        {/* Inner sub tabs toggle */}
        <div className="flex bg-gray-100 dark:bg-zinc-805 p-1 rounded-xl select-none">
          <button
            onClick={() => setActiveSubTab('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'split' ? 'bg-white dark:bg-zinc-950 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500'
            }`}
          >
            Split Bills
          </button>
          <button
            onClick={() => setActiveSubTab('debts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'debts' ? 'bg-white dark:bg-zinc-950 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500'
            }`}
          >
            Debt Tracker
          </button>
          <button
            onClick={() => setActiveSubTab('investments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'investments' ? 'bg-white dark:bg-zinc-950 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500'
            }`}
          >
            SIP Portfolio
          </button>
        </div>
      </div>

      {activeSubTab === 'split' && (
        <div id="split-bills-module" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel split form */}
          <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-gray-100 p-5 rounded-2xl shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white text-base">New Split Calculator</h3>
              <p className="text-xs text-gray-400">Distribute equal shares with friends.</p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-500 uppercase tracking-wide block mb-1">Total Bill Description</label>
                <input
                  type="text"
                  placeholder="E.g., Dinner at Chef Table, Airbnb cabin book"
                  value={splitDesc}
                  onChange={(e) => setSplitDesc(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-850 px-3 py-2.5 rounded-xl border border-gray-200 font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-500 uppercase tracking-wide block mb-1">Total Amount Paid</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">{currencySymbol}</span>
                  <input
                    type="number"
                    placeholder="2500"
                    value={splitTotal}
                    onChange={(e) => setSplitTotal(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-850 pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-gray-50 pt-2">
                <label className="font-bold text-gray-500 uppercase tracking-wide block mb-1">Add Friends involved</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Friend name"
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    className="flex-1 bg-gray-50 dark:bg-zinc-850 px-3 py-2 rounded-xl border border-gray-200 font-semibold focus:outline-none"
                  />
                  <button
                    onClick={handleAddFriendToSplit}
                    className="p-2 bg-emerald-500 text-white rounded-xl font-bold cursor-pointer hover:bg-emerald-600 px-3 shrink-0"
                  >
                    Add
                  </button>
                </div>

                {/* Friend list badges */}
                <div className="flex flex-wrap gap-2 mt-3 select-none">
                  {friendList.map((f, i) => (
                    <span key={i} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-350 rounded-lg text-[10px] font-bold flex items-center gap-1">
                      <span>{f.name}</span>
                      <button onClick={() => setFriendList(friendList.filter((_, idx) => idx !== i))} className="text-emerald-600 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateSplit}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-sm transition cursor-pointer pt-3 mt-4 block text-center"
              >
                Division shares & Lock Split
              </button>
            </div>
          </div>

          {/* Right list splits */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-100 p-5 rounded-2xl shadow-xs space-y-4 overflow-y-auto max-h-[420px]">
            <div>
              <h3 className="font-bold text-gray-850 dark:text-white text-base">Group Ledger splits</h3>
              <p className="text-xs text-gray-400">Track who paid, shares division, and settling statuses.</p>
            </div>

            <div className="space-y-4">
              {splitExpenses.map((se) => (
                <div key={se.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/25 dark:bg-zinc-850/5 text-xs text-gray-700 dark:text-zinc-300">
                  <div className="flex justify-between items-start gap-4 mb-3 border-b border-gray-50 pb-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-800 dark:text-white">{se.description}</h4>
                      <p className="text-[10px] text-gray-450 mt-0.5">Paid by {se.paidBy} • total {currencySymbol}{se.totalAmount.toLocaleString()}</p>
                    </div>
                    <span className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/25 px-2 py-0.5 rounded-md">
                      Share: {currencySymbol}{Math.round(se.totalAmount / (se.friends.length + 1)).toLocaleString()} / Person
                    </span>
                  </div>

                  {/* Friends shares details */}
                  <div className="space-y-2">
                    {se.friends.map((f, i) => (
                      <div key={i} className="flex justify-between items-center bg-white dark:bg-zinc-800/20 p-2.5 rounded-lg border border-gray-50 dark:border-zinc-800">
                        <div className="flex items-center gap-2 font-semibold">
                          <UserCheck className="w-4 h-4 text-emerald-500" />
                          <span>{f.name} owes you</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-950 dark:text-white">{currencySymbol}{f.amount.toLocaleString()}</span>
                          {f.settled ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-extrabold text-[9px] uppercase">Settled</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 font-extrabold text-[9px] uppercase">Owes</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {splitExpenses.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                  <Share2 className="w-8 h-8 stroke-1 mx-auto text-gray-300 mb-2" />
                  <span>No group ledger splits locked. Use the split pane tool to allocate bills.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {activeSubTab === 'debts' && (
        <div id="debt-tracker-module" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Active Claims and Liabilities</h3>
              <p className="text-xs text-gray-405">Lent claims of borrowed liabilities ledger lists.</p>
            </div>
            <button
              onClick={() => setIsDebtFormOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-800 text-white font-bold text-xs rounded-lg hover:scale-105 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Claim</span>
            </button>
          </div>

          {isDebtFormOpen && (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
              <div className="bg-white dark:bg-zinc-900 border p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
                <button onClick={() => setIsDebtFormOpen(false)} className="absolute top-4 right-4 p-1 rounded hover:bg-gray-50 cursor-pointer">
                  <X className="w-4.5 h-4.5 text-gray-400" />
                </button>
                <h3 className="font-bold text-base mb-4 text-gray-900 dark:text-white">Log Debt Transfer</h3>

                <form onSubmit={handleCreateDebt} className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold block text-gray-500 mb-1">Transfer Class</label>
                    <select
                      value={debtType}
                      onChange={(e) => setDebtType(e.target.value as any)}
                      className="w-full bg-gray-50 dark:bg-zinc-850 px-3 py-2 rounded-xl border"
                    >
                      <option value="lent">I Lent Money (Somebody owes me)</option>
                      <option value="borrowed">I Borrowed Money (I owe somebody)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block text-gray-500 mb-1">Second Party Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nikhil, Uncle Sam"
                      value={debtParty}
                      onChange={(e) => setDebtParty(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-zinc-850 px-3 py-2 rounded-xl border focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold block text-gray-500 mb-1">Amount</label>
                      <input
                        type="number"
                        required
                        placeholder="1400"
                        value={debtAmount}
                        onChange={(e) => setDebtAmount(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-zinc-850 px-3 py-2 rounded-xl border focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold block text-gray-500 mb-1">Repayment Date</label>
                      <input
                        type="date"
                        value={debtDueDate}
                        onChange={(e) => setDebtDueDate(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-zinc-850 px-3 py-2 rounded-xl border focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold block text-gray-500 mb-1">Notes / Item description</label>
                    <input
                      type="text"
                      placeholder="cinema, trip refund deposit"
                      value={debtNotes}
                      onChange={(e) => setDebtNotes(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-zinc-850 px-3 py-2 rounded-xl border focus:outline-none"
                    />
                  </div>

                  <button type="submit" className="w-full py-2.5 bg-emerald-500 text-white rounded-xl font-bold cursor-pointer pt-3 block text-center">
                    Lock Debt
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* List debits */}
          <div className="bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="bg-gray-50/50 border-b uppercase font-extrabold text-[9px] tracking-wider text-gray-400">
                  <th className="p-3 pl-5">Class</th>
                  <th className="p-3">Party</th>
                  <th className="p-3">Notes</th>
                  <th className="p-3">Repayment Date</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center pr-5">Settle Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-700 dark:text-zinc-300">
                {debts.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-3 pl-5">
                      {d.type === 'lent' ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold uppercase text-[9px]">Lent</span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-extrabold uppercase text-[9px]">Borrowed</span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-gray-900 dark:text-white">{d.party}</td>
                    <td className="p-3">{d.notes || '---'}</td>
                    <td className="p-3 font-mono">{d.dueDate}</td>
                    <td className="p-3 text-right font-bold text-sm text-gray-900 dark:text-white font-mono">{currencySymbol}{d.amount.toLocaleString()}</td>
                    <td className="p-3 text-center pr-5">
                      {d.settled ? (
                        <span className="text-emerald-500 font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Cleared</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onSettleDebt(d.id)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded text-[10px] font-extrabold uppercase cursor-pointer"
                        >
                          Settle Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {debts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">Claims register empty.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'investments' && (
        <div id="investments-tracker-module" className="space-y-6">
          
          {/* ROI stats banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-zinc-900 border p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-semibold">Total Invested (Principal)</span>
                <span className="font-extrabold text-lg text-gray-800 dark:text-white font-mono">{currencySymbol}{totalPrincipal.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-semibold">Current Value (Asset)</span>
                <span className="font-extrabold text-lg text-gray-800 dark:text-white font-mono">{currencySymbol}{totalValue.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-emerald-500 text-white rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-white/80 block font-semibold">Total ROI Yield</span>
                <div className="flex gap-2.5 items-center">
                  <span className="font-extrabold text-lg text-white font-mono">+{currencySymbol}{roiVal.toLocaleString()}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-700/50 text-[10px] text-white font-black">+{Math.round(roiPct)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Investment list header */}
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-800 dark:text-white text-base">Growth Portfolios</h3>
            <button
              onClick={() => setIsInvFormOpen(true)}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 shadow-sm text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add asset class</span>
            </button>
          </div>

          {isInvFormOpen && (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
              <div className="bg-white dark:bg-zinc-900 border p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
                <button onClick={() => setIsInvFormOpen(false)} className="absolute top-4 right-4 p-1 rounded cursor-pointer">
                  <X className="w-4.5 h-4.5 text-gray-400" />
                </button>
                <h3 className="font-bold text-base mb-4 text-gray-900 dark:text-white">Track investment</h3>

                <form onSubmit={handleCreateInvestment} className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold block text-gray-500 mb-1">Asset Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Vanguard Index ETF, Ethereum hold, SIP mutual fund"
                      value={invName}
                      onChange={(e) => setInvName(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-zinc-850 px-3 py-2 rounded-xl border focus:outline-none focus:ring-1"
                    />
                  </div>

                  <div>
                    <label className="font-bold block text-gray-500 mb-1">Asset Category</label>
                    <select
                      value={invType}
                      onChange={(e) => setInvType(e.target.value as any)}
                      className="w-full bg-gray-50 dark:bg-zinc-850 px-3 py-2 rounded-xl border"
                    >
                      <option value="stocks">Stocks / Equities</option>
                      <option value="mutual_funds">Mutual Funds</option>
                      <option value="sip">SIP Systematic Investments</option>
                      <option value="fixed_deposits">Fixed Deposits (FD)</option>
                      <option value="crypto">Cryptocurrency Holdings</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold block text-gray-500 mb-1">Principal Invested</label>
                      <input
                        type="number"
                        required
                        placeholder="10000"
                        value={invPrincipal}
                        onChange={(e) => setInvPrincipal(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-zinc-850 px-3 py-2 rounded-xl border focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold block text-gray-500 mb-1">Current Value</label>
                      <input
                        type="number"
                        placeholder="11500"
                        value={invCurrent}
                        onChange={(e) => setInvCurrent(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-zinc-850 px-3 py-2 rounded-xl border focus:outline-none"
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-2.5 bg-emerald-500 text-white font-bold rounded-xl active:scale-95 transition cursor-pointer">
                    Monitor portfolio Asset
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Table list investments */}
          <div className="bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
              {investments.map((i) => {
                const profit = i.currentValue - i.principalAmount;
                const roiPct = i.principalAmount > 0 ? (profit / i.principalAmount) * 105 : 0;
                const isLoss = profit < 0;

                return (
                  <div key={i.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/20 dark:bg-zinc-850/10 space-y-3 hover:border-emerald-300 transition duration-150 relative group">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-[9px] font-extrabold text-gray-500 uppercase">{i.type}</span>
                        <h4 className="font-bold text-sm text-gray-800 dark:text-white mt-1.5">{i.name}</h4>
                      </div>
                      
                      {/* Price Updater dynamic simulator click */}
                      <button
                        onClick={() => onUpdateInvestment(i.id, Math.round(i.currentValue * (0.95 + Math.random() * 0.12)))}
                        className="text-[10px] text-emerald-500 border border-emerald-200 p-1 rounded-md opacity-0 group-hover:opacity-100 font-extrabold hover:bg-emerald-50 transition cursor-pointer shrink-0"
                        title="Simulate current price quote fluctuation ticker"
                      >
                        Sim Ticker PRICE
                      </button>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/80 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400 text-[10px] block font-bold">Principal</span>
                        <span className="font-semibold text-gray-800 dark:text-zinc-300 font-mono">{currencySymbol}{i.principalAmount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block font-bold">Current Asset Value</span>
                        <span className="font-bold text-gray-900 dark:text-white font-mono">{currencySymbol}{i.currentValue.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* ROI card segment indicator */}
                    <div className={`p-2 rounded-lg text-[11px] font-bold flex items-center justify-between ${
                      isLoss ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      <span>Yield ROI:</span>
                      <span className="font-mono">{isLoss ? '-' : '+'}{currencySymbol}{Math.abs(profit).toLocaleString()} ({Math.round(roiPct)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
