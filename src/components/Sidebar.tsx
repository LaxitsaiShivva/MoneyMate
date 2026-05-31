import React from 'react';
import {
  LayoutDashboard,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Target,
  Sparkles,
  Landmark,
  FileText,
  ShieldCheck,
  LogOut,
  User,
  TrendingUp,
  Flame
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile;
  onLogout: () => void;
  isAdmin: boolean;
}

export default function Sidebar({ activeTab, setActiveTab, user, onLogout, isAdmin }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: ArrowDownRight },
    { id: 'incomes', label: 'Incomes', icon: ArrowUpRight },
    { id: 'budgets', label: 'Budgets & limits', icon: Wallet },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'ai-insights', label: 'AI Advisor', icon: Sparkles },
    { id: 'premium', label: 'Premium Suite', icon: Landmark },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: ShieldCheck });
  }

  return (
    <div
      id="app-sidebar-nav"
      className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800"
    >
      {/* App Logo */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-emerald-500 p-2 rounded-lg text-white shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight text-white block">
            Money<span className="text-emerald-400">Mate</span>
          </span>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">SMART FINANCE</p>
        </div>
      </div>

      {/* User Mini Profile */}
      <div className="p-3.5 mx-3.5 my-3 bg-slate-800/60 border border-slate-700/30 rounded-xl flex items-center gap-2.5">
        <div className="w-8 h-8 bg-emerald-500/10 text-emerald-400 font-bold rounded-lg flex items-center justify-center border border-emerald-500/20 text-xs shrink-0">
          {user.name ? user.name[0].toUpperCase() : 'U'}
        </div>
        <div className="flex-1 overflow-hidden">
          <h4 className="font-bold text-xs text-white truncate leading-tight">
            {user.name || 'Sign In'}
          </h4>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mt-0.5">
            <Flame className="w-3 h-3 text-orange-500 fill-orange-500 shrink-0" />
            <span>{user.dailyStreak}d</span>
            <span className="text-slate-600">•</span>
            <span className="bg-slate-700 text-slate-300 px-1 rounded text-[9px] font-bold">
              Lvl {user.level}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 px-3 space-y-1 py-2 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                isActive
                  ? 'bg-emerald-600/10 text-emerald-400 font-bold border-l-2 border-emerald-500 rounded-l-none'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile Settings / Logout */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <button
          id="btn-settings-tab"
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-slate-850 text-white font-bold'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <User className="w-4 h-4 text-slate-500" />
          <span>Profile Settings</span>
        </button>

        <button
          id="btn-sidebar-logout"
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
