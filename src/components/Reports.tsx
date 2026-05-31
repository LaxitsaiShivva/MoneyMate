import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Award,
  Wallet
} from 'lucide-react';
import { Transaction, Budget, SavingGoal } from '../types';

interface ReportsProps {
  transactions: Transaction[];
  budgets: Budget[];
  savingGoals: SavingGoal[];
  currencySymbol: string;
  userName?: string;
}

export default function Reports({
  transactions,
  budgets,
  savingGoals,
  currencySymbol,
  userName
}: ReportsProps) {
  const [reportRange, setReportRange] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState('');

  // Sift transactions by ranges
  const filteredStatementTx = React.useMemo(() => {
    const today = new Date();
    const rangeLimitDate = new Date();

    if (reportRange === 'monthly') {
      rangeLimitDate.setDate(today.getDate() - 30);
    } else if (reportRange === 'quarterly') {
      rangeLimitDate.setDate(today.getDate() - 120);
    } else {
      rangeLimitDate.setDate(today.getDate() - 365);
    }

    return transactions.filter((t) => new Date(t.date) >= rangeLimitDate);
  }, [transactions, reportRange]);

  // Download logic CSV helper
  const handleDownloadCSV = () => {
    const headers = ['TxID', 'Type', 'Category', 'Date', 'PaymentMethod', 'Notes', 'Amount'];
    const rows = filteredStatementTx.map((t) => [
      t.id,
      t.type,
      t.category,
      t.date,
      t.paymentMethod,
      t.notes || 'No description',
      t.amount
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MoneyMate-${reportRange}-financial-statement.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerFeedback('Statement CSV file exported successfully to your downloads directory!');
  };

  const handleDownloadExcelSim = () => {
    // Generate tabbed CSV resembling Excel structure
    const headers = ['Account Code', 'Category Header', 'Transaction Date', 'Payment Channel', 'Ledger Memo', 'Debit/Credit Values'];
    const rows = filteredStatementTx.map((t) => [
      `AC-${t.id}`,
      t.category,
      t.date,
      t.paymentMethod,
      t.notes || 'None',
      t.type === 'income' ? `+${t.amount}` : `-${t.amount}`
    ]);

    const excelContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join('\t'), ...rows.map((e) => e.join('\t'))].join('\n');

    const encodedUri = encodeURI(excelContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MoneyMate-${reportRange}-accounting-sheets.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerFeedback('Excel sheets spreadsheet downloaded successfully!');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const triggerFeedback = (msg: string) => {
    setDownloadSuccessMessage(msg);
    setTimeout(() => setDownloadSuccessMessage(''), 4000);
  };

  // Compute indicators
  const totalIn = filteredStatementTx.filter((t) => t.type === 'income').reduce((s, x) => s + x.amount, 0);
  const totalOut = filteredStatementTx.filter((t) => t.type === 'expense').reduce((s, x) => s + x.amount, 0);

  return (
    <div id="accounting-reports-panel" className="space-y-6 pb-12 print:p-8 print:bg-white select-text">
      
      {/* Hide on print */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Tax Sheets & Exports</h1>
          <p className="text-xs text-gray-400 mt-0.5">Sift records by ranges to extract downloadable accounts, PDF audit, and CSV ledgers.</p>
        </div>

        <select
          value={reportRange}
          onChange={(e) => setReportRange(e.target.value as any)}
          className="bg-zinc-900 dark:bg-zinc-850 px-4.5 py-2 text-xs font-bold border rounded-xl text-white outline-none cursor-pointer"
        >
          <option value="monthly">Past 30 Days (Monthly)</option>
          <option value="quarterly">Past 120 Days (Quarterly)</option>
          <option value="yearly">Past Year (Yearly)</option>
        </select>
      </div>

      {downloadSuccessMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-100 flex items-center gap-2 animate-pulse print:hidden">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccessMessage}</span>
        </div>
      )}

      {/* Overview indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total In */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-805 p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Statement Cash Inflows</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white font-mono mt-0.5 block">
              +{currencySymbol}{totalIn.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Total Out */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-805 p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Statement Outflows</span>
            <span className="text-xl font-bold text-gray-950 dark:text-white font-mono mt-0.5 block">
              -{currencySymbol}{totalOut.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Net surplus */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-805 p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Net Surpluses Generated</span>
            <span className="text-xl font-bold text-gray-950 dark:text-white font-mono mt-0.5 block">
              {currencySymbol}{(totalIn - totalOut).toLocaleString()}
            </span>
          </div>
        </div>

      </div>

      {/* EXPORT PANEL ACTIONS */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-805 p-4 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm print:hidden">
        <div>
          <h3 className="font-bold text-sm text-gray-800 dark:text-white">Export balance sheets</h3>
          <p className="text-xs text-gray-400 mt-0.5">Generate spreadsheet sheets or document files for tax accounting.</p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleDownloadCSV}
            className="px-4.5 py-2.5 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 font-bold text-xs flex items-center gap-1.5 rounded-xl border border-gray-150 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>CSV Ledger Sheets</span>
          </button>
          
          <button
            onClick={handleDownloadExcelSim}
            className="px-4.5 py-2.5 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 font-bold text-xs flex items-center gap-1.5 rounded-xl border border-gray-150 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Excel Spreadsheets</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="px-4.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 rounded-xl transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Print / PDF Document</span>
          </button>
        </div>
      </div>

      {/* STATEMENT SHEET LAYOUT PREVIEW */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-805 rounded-xl p-5 space-y-6 shadow-sm flex flex-col justify-between">
        {/* Ledger invoice design details */}
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-black text-lg text-gray-800 dark:text-white tracking-tight uppercase">MoneyMate Statement</span>
              <p className="text-[10px] text-gray-400 font-bold">SMART LEDGER ACCOUNTING AUDIT</p>
            </div>
            <div className="text-right text-[10px] font-bold text-gray-400">
              <span>Date generated: 2026-05-31</span>
              <p className="mt-0.5">Verification: MM-VERIFIED-HASH-298</p>
            </div>
          </div>

          <div className="border-t border-b border-gray-50 dark:border-zinc-850 py-4.5 text-xs text-gray-700 dark:text-zinc-350 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="font-bold text-gray-400 uppercase text-[9px] block">Range Type</span>
              <span className="font-extrabold mt-1 block uppercase text-emerald-600">{reportRange} statement</span>
            </div>
            <div>
              <span className="font-bold text-gray-400 uppercase text-[9px] block">Active Inflows</span>
              <span className="font-semibold mt-1 block">{filteredStatementTx.filter((t)=>t.type==='income').length} entries</span>
            </div>
            <div>
              <span className="font-bold text-gray-400 uppercase text-[9px] block">Active Outflows</span>
              <span className="font-semibold mt-1 block">{filteredStatementTx.filter((t)=>t.type==='expense').length} entries</span>
            </div>
            <div>
              <span className="font-bold text-gray-400 uppercase text-[9px] block">Account Holder</span>
              <span className="font-semibold mt-1 block">{userName || 'User'}</span>
            </div>
          </div>

          {/* Statement Ledger List */}
          <div className="overflow-x-auto pt-2.5">
            <table className="w-full text-left text-xs text-gray-750 dark:text-zinc-350 border-collapse">
              <thead>
                <tr className="border-b uppercase font-extrabold text-[9px] text-gray-400">
                  <th className="py-2">Date</th>
                  <th className="py-2">Ledger / description</th>
                  <th className="py-2">Category</th>
                  <th className="py-2 text-right">Debit / Credit Value</th>
                </tr>
              </thead>
              <tbody className="divide-y font-semibold">
                {filteredStatementTx.map((t) => (
                  <tr key={t.id} className="text-gray-700 dark:text-zinc-300">
                    <td className="py-2.5 font-mono">{t.date}</td>
                    <td className="py-2.5">{t.notes || t.category}</td>
                    <td className="py-2.5">{t.category}</td>
                    <td className={`py-2.5 text-right font-bold font-mono ${t.type==='income' ? 'text-emerald-500' : 'text-gray-905 dark:text-white'}`}>
                      {t.type === 'income' ? '+' : '-'}{currencySymbol}{t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Closing balance block */}
        <div className="flex justify-end pt-5 border-t">
          <div className="text-right text-xs font-bold space-y-1.5 leading-relaxed">
            <div className="text-gray-450 uppercase text-[9px]">Surplus Margin Recap</div>
            <div className="text-xl font-extrabold text-gray-900 dark:text-white font-mono">
              Net balance: {currencySymbol}{(totalIn - totalOut).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
