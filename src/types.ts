export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  paymentMethod: string;
  notes?: string;
  receiptUrl?: string; // Contains photo or processed info
  isRecurring?: boolean;
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  completed: boolean;
}

export interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  category: string;
  interval: 'weekly' | 'monthly';
  nextDueDate: string;
  notes?: string;
  active: boolean;
}

export interface FriendRow {
  name: string;
  amount: number;
  settled: boolean;
}

export interface SplitExpense {
  id: string;
  description: string;
  totalAmount: number;
  paidBy: string;
  friends: FriendRow[];
  date: string;
}

export interface Debt {
  id: string;
  type: 'lent' | 'borrowed';
  party: string;
  amount: number;
  dueDate: string;
  notes?: string;
  settled: boolean;
}

export interface Investment {
  id: string;
  name: string;
  type: 'stocks' | 'mutual_funds' | 'sip' | 'fixed_deposits' | 'crypto';
  principalAmount: number;
  currentValue: number;
  lastUpdated: string;
}

export interface UserProfile {
  name: string;
  email: string;
  currency: string; // 'USD' | 'INR' | 'EUR' | 'GBP' | 'JPY'
  profileImage?: string;
  dailyStreak: number;
  xp: number;
  level: number;
  enable2FA: boolean;
  theme: 'light' | 'dark';
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'warning' | 'success';
  date: string;
  read: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: 'savings' | 'budget' | 'streak' | 'invest' | 'general';
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}
