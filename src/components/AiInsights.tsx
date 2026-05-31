import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  RefreshCw,
  Plus,
  Mic,
  Send,
  HelpCircle,
  ThumbsUp,
  Brain,
  History,
  TrendingDown,
  Volume2
} from 'lucide-react';
import { Transaction, Budget, UserProfile } from '../types';

interface AiInsightsProps {
  transactions: Transaction[];
  budgets: Budget[];
  user: UserProfile;
  currencySymbol: string;
  onApplyVoiceParsedTransaction: (parsed: { amount: number; type: 'income' | 'expense'; category: string; notes: string; date: string }) => void;
}

export default function AiInsights({
  transactions,
  budgets,
  user,
  currencySymbol,
  onApplyVoiceParsedTransaction
}: AiInsightsProps) {
  // AI Insights State
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insights, setInsights] = useState<{
    summary: string;
    insights: string[];
    recommendations: string[];
    predictions: string;
    nextMonthEstimate: number;
  } | null>(null);

  // Chatbot State
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; content: string }[]>([
    { role: 'model', content: `Hello! I am MoneyMate, your dedicated AI Financial Companion. I have complete secure visibility into your logged ledgers, budget configurations, and goal pathways. How can I help you improve your financial health or plan savings today?` }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Voice/Text Entry State
  const [voiceText, setVoiceText] = useState('');
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatLoading]);

  // Load / Compute AI Insights
  const fetchAiInsights = async (forceRefresh = false) => {
    if (insights && !forceRefresh) return;
    setInsightsLoading(true);
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions,
          budgets,
          currency: currencySymbol
        })
      });
      const data = await response.json();
      if (data.success && data.data) {
        setInsights(data.data);
      } else {
        // Fallback robust computation if keys are missing
        const exp = transactions.filter((t) => t.type === 'expense');
        const inc = transactions.filter((t) => t.type === 'income');
        const totExp = exp.reduce((s, x) => s + x.amount, 0);
        const totInc = inc.reduce((s, x) => s + x.amount, 0);

        setInsights({
          summary: `Our offline financial model indicates you have logged ${currencySymbol}${totInc.toLocaleString()} in income against ${currencySymbol}${totExp.toLocaleString()} in total expenses.`,
          insights: [
            `Food and utilities form the bulk of your expenditure.`,
            `Your monthly savings rate stands around ${totInc > 0 ? Math.round(((totInc - totExp) / totInc) * 100) : 0}%.`,
          ],
          recommendations: [
            `Establish a strict entertainment cap at ${currencySymbol}3,000 this month.`,
            `Consolidate subscription bills to save an estimated ${currencySymbol}1,200.`
          ],
          predictions: `Based on your average spending pattern, next month spending is projected to hover around ${currencySymbol}${Math.round(totExp * 1.05).toLocaleString()}.`,
          nextMonthEstimate: Math.round(totExp * 1.05)
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    fetchAiInsights();
  }, [transactions, budgets]);

  // Advisor chatbot message send
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage.trim();
    setHistoryAndSend(userMsg);
  };

  const setHistoryAndSend = async (msg: string) => {
    const updatedHistory = [...chatHistory, { role: 'user' as const, content: msg }];
    setChatHistory(updatedHistory);
    setChatMessage('');
    setChatLoading(true);

    // Compute basic finance details to inject for advisory accuracy
    const exp = transactions.filter((t) => t.type === 'expense');
    const inc = transactions.filter((t) => t.type === 'income');
    const totExp = exp.reduce((s, x) => s + x.amount, 0);
    const totInc = inc.reduce((s, x) => s + x.amount, 0);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: updatedHistory.slice(0, -1), // skip adding itself twice
          finances: {
            income: totInc,
            expense: totExp,
            balance: totInc - totExp,
            investmentsTotal: 92100, // mock aggregated sip index
            goalsCount: 3
          },
          currency: currencySymbol
        })
      });
      const data = await response.json();
      if (data.reply) {
        setChatHistory((prev) => [...prev, { role: 'model', content: data.reply }]);
      } else {
        setChatHistory((prev) => [...prev, { role: 'model', content: `Got your question! To optimize your spending: (1) Reduce food and entertainment spending, (2) Boost retirement SIP and emergency funds, (3) Plan recurring transactions via MoneyMate. Set up a Gemini API Key to enable complete chat advisor responses!` }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChatLoading(false);
    }
  };

  // Natural Language Voice expense entry parsing
  const handleParseVoiceText = async () => {
    if (!voiceText.trim()) {
      alert('Please type or dictate a natural sentence log first!');
      return;
    }
    setVoiceLoading(true);
    setVoiceStatus('Sifting variables via Gemini AI...');
    try {
      const response = await fetch('/api/ai/voice-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speechText: voiceText })
      });
      const data = await response.json();
      if (data.success && data.data) {
        const parsed = data.data;
        onApplyVoiceParsedTransaction({
          amount: parsed.amount,
          type: parsed.type,
          category: parsed.category || 'Other',
          notes: parsed.notes || 'Speech recorded log',
          date: parsed.date || new Date().toISOString().split('T')[0]
        });
        setVoiceStatus('Success to ledger! Entry added successfully.');
        setVoiceText('');
      } else {
        // Simple offline regex logic
        const matches = voiceText.match(/\d+/g);
        const amount = matches ? parseInt(matches[0]) : 500;
        const lowercase = voiceText.toLowerCase();
        let cat = 'Other';
        if (lowercase.includes('starbucks') || lowercase.includes('coffee') || lowercase.includes('food') || lowercase.includes('dinner')) cat = 'Food';
        else if (lowercase.includes('uber') || lowercase.includes('taxi') || lowercase.includes('ticket')) cat = 'Transport';

        onApplyVoiceParsedTransaction({
          amount,
          type: lowercase.includes('earned') || lowercase.includes('salary') || lowercase.includes('received') ? 'income' : 'expense',
          category: cat,
          notes: voiceText,
          date: new Date().toISOString().split('T')[0]
        });
        setVoiceStatus('Offline backup logic applied. Structured and added!');
        setVoiceText('');
      }
      setTimeout(() => setVoiceStatus(''), 4000);
    } catch (err) {
      console.error(err);
      setVoiceStatus('Failed to structure logs.');
    } finally {
      setVoiceLoading(false);
    }
  };

  // Local speech activator simulator
  const handleMicrophoneSimulator = () => {
    const speechResponses = [
      "I spent 450 on food at burger bar",
      "Received a salary of 50000 yesterday",
      "Bought an emergency medicine kit for 1200",
      "Paid rent of 12000 of apartment bills"
    ];
    const picked = speechResponses[Math.floor(Math.random() * speechResponses.length)];
    setVoiceText(picked);
    setVoiceStatus('Microphone capture captured sample: ' + picked);
  };

  return (
    <div id="ai-hub-panel" className="space-y-6 pb-12">
      <div className="flex justify-between items-center pb-4 border-b border-gray-150 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-500 fill-emerald-500/10" />
            <span>AI Copilot & Wealth Engine</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Harness generative models to analyze spending habits, predict bills, and automate inputs.</p>
        </div>

        <button
          onClick={() => fetchAiInsights(true)}
          className="p-2 border border-gray-150 dark:border-zinc-800 rounded-xl text-gray-600 dark:text-zinc-400 hover:bg-gray-50 flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${insightsLoading ? 'animate-spin' : ''}`} />
          <span>Sync Intelligence</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left Side: Generative Advisor Companion Chatbot */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-xl p-4 flex flex-col h-[520px] shadow-sm">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-50 dark:border-zinc-850">
            <div className="p-2.5 bg-emerald-500 rounded-xl text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">MoneyMate Advisor</h3>
              <p className="text-[10px] text-emerald-500 font-extrabold uppercase">ONLINE COMPANION • GEMINI 3.5 FLASH</p>
            </div>
          </div>

          {/* Chat scroll content */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 text-xs select-text">
            {chatHistory.map((ch, idx) => (
              <div key={idx} className={`flex ${ch.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    ch.role === 'user'
                      ? 'bg-emerald-500 text-white font-semibold rounded-tr-none shadow-sm'
                      : 'bg-gray-50 dark:bg-zinc-805 text-gray-800 dark:text-zinc-200 border border-gray-100 dark:border-zinc-850 rounded-tl-none font-medium'
                  }`}
                >
                  {ch.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 dark:bg-zinc-805 text-gray-400 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-zinc-850 font-bold flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                  <span>AI Advisor is consulting ledger sheets...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick preset queries */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 select-none">
            <button
              onClick={() => setHistoryAndSend('What is my current savings rate, and how can I boost it?')}
              className="px-3 py-1 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-805 border dark:border-zinc-800 shrink-0 rounded-lg text-[10px] font-bold text-gray-500 cursor-pointer"
            >
              How can I improve my savings?
            </button>
            <button
              onClick={() => setHistoryAndSend('Analyze my food expense budgets')}
              className="px-3 py-1 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-850 border dark:border-zinc-800 shrink-0 rounded-lg text-[10px] font-bold text-gray-500 cursor-pointer"
            >
              Analyze food budget spent
            </button>
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="flex gap-2 border-t border-gray-50 dark:border-zinc-800/80 pt-3">
            <input
              type="text"
              placeholder="Ask me: How can I save more? Or list my next month bill prediction..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 bg-gray-50 dark:bg-zinc-850 pl-3.5 pr-2 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs font-semibold focus:outline-none"
            />
            <button
              type="submit"
              className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl active:scale-95 transition cursor-pointer"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>

        {/* Right Side: Voice natural-language typing & Generative insights summary dashboard */}
        <div className="space-y-6">
          
          {/* Natural Language Voice Console */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-4 rounded-xl shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                <Brain className="w-5 h-5 text-emerald-500 animate-pulse" />
                <span>Voice & Dialect Log Engine</span>
              </h3>
              <p className="text-[10px] text-gray-400">Speak of type transactions to file structured ledgers instantly.</p>
            </div>

            {/* Simulated Voice entry */}
            <div className="relative">
              <input
                type="text"
                placeholder="E.g., Bought lunch at subway for 450 rupees yesterday, got freelance payout 15000"
                value={voiceText}
                onChange={(e) => setVoiceText(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-805 pl-3.5 pr-12 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none"
              />
              <button
                type="button"
                onClick={handleMicrophoneSimulator}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-emerald-100/60 dark:bg-emerald-950/20 rounded-lg hover:bg-emerald-250 hover:scale-105 text-emerald-600 transition cursor-pointer"
                title="Dictate simulator"
              >
                <Mic className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Actions button */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-[10px] font-bold text-gray-500">
                {voiceStatus && <span className="text-emerald-550 dark:text-emerald-400">{voiceStatus}</span>}
              </div>
              <button
                onClick={handleParseVoiceText}
                disabled={voiceLoading}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-[11px] rounded-xl flex items-center gap-1.5 shadow transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Structure & Insert</span>
              </button>
            </div>
          </div>

          {/* Generative financial health observations */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-5 rounded-xl shadow-sm space-y-4 max-h-[310px] overflow-y-auto">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
              <Volume2 className="w-4.5 h-4.5 text-emerald-500" />
              <span>Smart Financial Projections</span>
            </h3>

            {insightsLoading ? (
              <div className="text-center py-10 space-y-2 text-xs font-bold text-gray-450 select-none">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500" />
                <p>Generating monthly forecasting reports with Gemini...</p>
              </div>
            ) : (
              insights && (
                <div className="space-y-4 text-xs leading-relaxed">
                  {/* Summary */}
                  <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/30 rounded-xl text-emerald-800 dark:text-emerald-300">
                    <span className="font-bold block uppercase tracking-wider text-[9px] mb-1">AI Executive Summary</span>
                    {insights.summary}
                  </div>

                  {/* Bullet insights */}
                  <div className="space-y-2">
                    <span className="font-bold text-gray-400 uppercase tracking-wider text-[9px]">AI Habit Insights</span>
                    {insights.insights.map((ins, i) => (
                      <div key={i} className="flex items-start gap-2 text-gray-700 dark:text-zinc-300">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                        <span>{ins}</span>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-gray-400 uppercase tracking-wider text-[9px]">Action Pathways</span>
                    {insights.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-gray-700 dark:text-zinc-350">
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>

                  {/* Projections estimate */}
                  <div className="pt-2.5 border-t border-gray-50 dark:border-zinc-850 flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-400">Projected Outlook Spend (Next Month)</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-extrabold">
                      {currencySymbol}{insights.nextMonthEstimate.toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
