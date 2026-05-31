import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Activity,
  Plus,
  Trash2,
  ListCollapse,
  Radio,
  Clock,
  Terminal,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { UserProfile, UserNotification } from '../types';

interface AdminPanelProps {
  user: UserProfile;
  notifications: UserNotification[];
  onBroadcastNotification: (title: string, message: string) => void;
  categories: string[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (name: string) => void;
}

export default function AdminPanel({
  user,
  notifications,
  onBroadcastNotification,
  categories,
  onAddCategory,
  onDeleteCategory
}: AdminPanelProps) {
  // Mock users database inside admin
  const [mockUsers, setMockUsers] = useState([
    { id: 1, name: user.name, email: user.email, level: user.level, dailyStreak: user.dailyStreak, role: 'Chief Admin' },
    { id: 2, name: 'Arjun Sen', email: 'arjun@gmail.com', level: 1, dailyStreak: 2, role: 'User' },
    { id: 3, name: 'Diya Murthy', email: 'diya22@gmail.com', level: 5, dailyStreak: 12, role: 'User' },
    { id: 4, name: 'Nikhil Mehta', email: 'n_mehta@gmail.com', level: 2, dailyStreak: 0, role: 'User' },
    { id: 5, name: 'Pooja Nair', email: 'pooja.nair@gmail.com', level: 4, dailyStreak: 8, role: 'User' }
  ]);

  // Alert fields
  const [broadTitle, setBroadTitle] = useState('');
  const [broadMessage, setBroadMessage] = useState('');
  const [broadSent, setBroadSent] = useState(false);

  // New category field
  const [newCatName, setNewCatName] = useState('');

  const triggerBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadTitle || !broadMessage) return;
    onBroadcastNotification(broadTitle, broadMessage);
    setBroadSent(true);
    setBroadTitle('');
    setBroadMessage('');
    setTimeout(() => setBroadSent(false), 3000);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setNewCatName('');
  };

  return (
    <div id="administrative-admin-panel" className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-7 h-7 text-emerald-500 fill-emerald-500/10" />
          <span>Operational Control Panel</span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">Administrative back-office console. Manage core entities, telemetry metrics, categories, and notification bands.</p>
      </div>

      {/* Top operational cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* User registers stat */}
        <div className="bg-white dark:bg-zinc-900 border p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
            <Users className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">Aggregated Accounts</span>
            <span className="text-xl font-bold font-mono mt-1 block">5 Active Registers</span>
          </div>
        </div>

        {/* Server status telemetry */}
        <div className="bg-white dark:bg-zinc-900 border p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
            <Activity className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">JSON-DB Micro-Server latency</span>
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">● Excellent (4ms)</span>
          </div>
        </div>

        {/* Database records counts */}
        <div className="bg-white dark:bg-zinc-900 border p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <Clock className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">Database Queries Executed</span>
            <span className="text-xl font-bold font-mono mt-1 block">35 Transactions</span>
          </div>
        </div>

      </div>

      {/* Main split sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Users list management panel */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border p-5 rounded-2xl shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-gray-850 dark:text-white text-base">Registered Account Sheets</h3>
            <p className="text-xs text-gray-400">View streak consistency metrics and operational standing roles.</p>
          </div>

          <div className="overflow-x-auto text-xs text-gray-750">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b uppercase font-bold text-[9px] text-gray-400">
                  <th className="p-3">User</th>
                  <th className="p-3">Standing Email</th>
                  <th className="p-3 text-center">Standing Level</th>
                  <th className="p-3 text-center">Streak</th>
                  <th className="p-3 text-center">Admin Status</th>
                </tr>
              </thead>
              <tbody className="divide-y font-semibold">
                {mockUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-3 text-gray-900 dark:text-zinc-100">{u.name}</td>
                    <td className="p-3 text-gray-500 font-mono">{u.email}</td>
                    <td className="p-3 text-center">Level {u.level}</td>
                    <td className="p-3 text-center text-orange-500 font-bold">{u.dailyStreak} days</td>
                    <td className="p-3 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-black ${
                        u.role === 'Chief Admin' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-50 text-gray-505'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notification core center sender */}
        <div className="space-y-6">
          {/* Notification broadcast form */}
          <div className="bg-white dark:bg-zinc-900 border p-5 rounded-2xl shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-gray-850 dark:text-white text-sm flex items-center gap-1">
                <Radio className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Broadcaster Alert Console</span>
              </h3>
              <p className="text-[10px] text-gray-400">Deploy immediate global alert banners across active client dashboards.</p>
            </div>

            <form onSubmit={triggerBroadcast} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold block text-gray-500 mb-1">Alert Title banner</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Server Software Upgrade"
                  value={broadTitle}
                  onChange={(e) => setBroadTitle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-850 px-3 py-2 rounded-xl border focus:outline-none focus:ring-1"
                />
              </div>

              <div>
                <label className="font-bold block text-gray-500 mb-1">Message Body</label>
                <textarea
                  required
                  rows={2}
                  placeholder="MoneyMate will briefly pause for maintenance in 2 hours."
                  value={broadMessage}
                  onChange={(e) => setBroadMessage(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-850 px-3 py-2 rounded-xl border focus:outline-none"
                />
              </div>

              {broadSent && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 font-bold rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Broadcast Deployed Instantly!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold cursor-pointer"
              >
                Send broadcast notifications
              </button>
            </form>
          </div>

          {/* Manage Categories Section */}
          <div className="bg-white dark:bg-zinc-900 border p-5 rounded-2xl shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-gray-850 dark:text-white text-sm flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Category configuration editor</span>
              </h3>
              <p className="text-[10px] text-gray-400">Edit standard option sets representing transaction classes.</p>
            </div>

            <form onSubmit={handleCreateCategory} className="flex gap-2 text-xs">
              <input
                type="text"
                required
                placeholder="New categories, e.g. Fitness"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 bg-gray-50 px-3 py-2 rounded-xl border focus:outline-none"
              />
              <button type="submit" className="px-3 bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl font-bold cursor-pointer">
                Add Tag
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-1.5 select-none">
              {categories.map((c) => (
                <span
                  key={c}
                  className="px-2 py-1 bg-gray-50 dark:bg-zinc-850 border rounded-lg text-[10px] font-bold text-gray-600 dark:text-zinc-300 flex items-center gap-1.5"
                >
                  <span>{c}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteCategory(c)}
                    className="text-gray-400 hover:text-red-500 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Underhood container server logs */}
      <div className="bg-white dark:bg-zinc-900 border p-5 rounded-2xl shadow-xs space-y-4">
        <h3 className="font-bold text-gray-850 dark:text-white text-sm flex items-center gap-1.5">
          <Terminal className="w-4.5 h-4.5 text-emerald-500" />
          <span>Active Server stdout logs</span>
        </h3>

        <div className="bg-gray-950 dark:bg-black font-mono text-[9px] p-4 rounded-xl border border-zinc-800 text-emerald-400 space-y-1 overflow-x-auto max-h-40">
          <div>[INFO] money-mate-microserver booting on host 0.0.0.0:3000... success</div>
          <div>[DB] schema integrity checks. table 'users' matched constraints</div>
          <div>[DB] seed database populated with default mock accounts</div>
          <div>[INFO] Gemini 3.5 AI controller initialized with telemetry UA headers</div>
          <div>[API] GET /api/user/data - served code 200 payload length 5892b</div>
          <div>[API] POST /api/user/data - state saved. synchronizing thread indices... complete</div>
        </div>
      </div>
    </div>
  );
}
