import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// JSON File Database helper to ensure persistence
const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default data if none exists
const defaultData = {
  transactions: [
    { id: 't1', amount: 45000, type: 'income', category: 'Salary', date: '2026-05-01', paymentMethod: 'Direct Deposit', notes: 'Monthly payout' },
    { id: 't2', amount: 3500, type: 'expense', category: 'Food', date: '2026-05-15', paymentMethod: 'Credit Card', notes: 'Weekly grocery run' },
    { id: 't3', amount: 12000, type: 'expense', category: 'Bills', date: '2026-05-02', paymentMethod: 'Bank Transfer', notes: 'Apartment rent' },
    { id: 't4', amount: 1500, type: 'expense', category: 'Entertainment', date: '2026-05-20', paymentMethod: 'Debit Card', notes: 'Streaming subscriptions' },
    { id: 't5', amount: 8000, type: 'income', category: 'Freelancing', date: '2026-05-12', paymentMethod: 'PayPal', notes: 'Logo design project' },
    { id: 't6', amount: 2000, type: 'expense', category: 'Transport', date: '2026-05-18', paymentMethod: 'Cash', notes: 'Fuel fillup' },
    { id: 't7', amount: 5000, type: 'expense', category: 'Investments', date: '2026-05-10', paymentMethod: 'Bank Transfer', notes: 'Nifty Index SIP' }
  ],
  budgets: [
    { category: 'Food', limit: 8000, spent: 3500 },
    { category: 'Shopping', limit: 5000, spent: 0 },
    { category: 'Transport', limit: 4000, spent: 2000 },
    { category: 'Entertainment', limit: 3000, spent: 1500 },
    { category: 'Education', limit: 6000, spent: 0 },
    { category: 'Healthcare', limit: 4000, spent: 0 },
    { category: 'Bills', limit: 15000, spent: 12000 },
    { category: 'Investments', limit: 10000, spent: 5000 },
    { category: 'Other', limit: 3000, spent: 0 }
  ],
  savingGoals: [
    { id: 'g1', name: 'Emergency Fund', targetAmount: 100000, currentAmount: 45000, targetDate: '2026-12-31', completed: false },
    { id: 'g2', name: 'Buy Laptop', targetAmount: 60000, currentAmount: 25000, targetDate: '2026-08-15', completed: false },
    { id: 'g3', name: 'Hawaii Vacation', targetAmount: 120000, currentAmount: 15000, targetDate: '2027-04-30', completed: false }
  ],
  recurringTransactions: [
    { id: 'r1', name: 'Netflix Premium', amount: 650, type: 'expense', category: 'Entertainment', interval: 'monthly', nextDueDate: '2026-06-15', notes: 'Automatic card charge', active: true },
    { id: 'r2', name: 'Apartment Rent', amount: 12000, type: 'expense', category: 'Bills', interval: 'monthly', nextDueDate: '2026-06-02', notes: 'Direct landlord transfer', active: true },
    { id: 'r3', name: 'Gym Membership', amount: 1200, type: 'expense', category: 'Healthcare', interval: 'monthly', nextDueDate: '2026-06-05', notes: 'Health is wealth', active: true }
  ],
  splitExpenses: [
    {
      id: 's1',
      description: 'Group Dinner at Chef Table',
      totalAmount: 6000,
      paidBy: 'You',
      friends: [
        { name: 'Arjun', amount: 2000, settled: false },
        { name: 'Diya', amount: 2000, settled: true }
      ],
      date: '2026-05-25'
    }
  ],
  debts: [
    { id: 'd1', type: 'lent', party: 'Arjun', amount: 2000, dueDate: '2026-06-10', notes: 'Chef Table lunch split', settled: false },
    { id: 'd2', type: 'borrowed', party: 'Nikhil', amount: 1500, dueDate: '2026-06-01', notes: 'Movie tickets', settled: false }
  ],
  investments: [
    { id: 'i1', name: 'Vanguard Index ETF', type: 'stocks', principalAmount: 25000, currentValue: 28400, lastUpdated: '2026-05-30' },
    { id: 'i2', name: 'Ethereum Wallet', type: 'crypto', principalAmount: 10000, currentValue: 9200, lastUpdated: '2026-05-30' },
    { id: 'i3', name: 'HDFC Balanced Advantage Fund', type: 'mutual_funds', principalAmount: 50000, currentValue: 54500, lastUpdated: '2026-05-29' }
  ],
  userProfile: {
    name: 'Shivva Manognya',
    email: 'shivvamanognya@gmail.com',
    currency: 'INR',
    dailyStreak: 5,
    xp: 350,
    level: 3,
    enable2FA: false,
    theme: 'light'
  },
  notifications: [
    { id: 'n1', title: 'Welcome to MoneyMate', message: 'Start tracking your expenses and let AI optimize your savings!', type: 'success', date: '2026-05-26', read: false },
    { id: 'n2', title: 'Rent Due Soon', message: 'Your recurring payment of ₹12,000 for Apartment Rent is due in 3 days.', type: 'info', date: '2026-05-29', read: false },
    { id: 'n3', title: 'Budget Warning', message: 'You have spent 80% of your Food budget limit!', type: 'warning', date: '2026-05-30', read: false }
  ],
  badges: [
    { id: 'b1', name: 'Starter Tracker', description: 'Created your first expense log', category: 'general', unlocked: true, unlockedAt: '2026-05-26', progress: 1, maxProgress: 1 },
    { id: 'b2', name: 'Savings Guru', description: 'Save a total of ₹50,000 across savings goals', category: 'savings', unlocked: true, unlockedAt: '2026-05-29', progress: 85000, maxProgress: 50000 },
    { id: 'b3', name: 'Budget Warrior', description: 'Maintain expense category spending under limits for 30 consecutive days', category: 'budget', unlocked: false, progress: 12, maxProgress: 30 },
    { id: 'b4', name: 'Active Investor', description: 'Register at least three investment classes', category: 'invest', unlocked: true, unlockedAt: '2026-05-30', progress: 3, maxProgress: 3 },
    { id: 'b5', name: 'Consistency King', description: 'Maintain a 10-day entries streak', category: 'streak', unlocked: false, progress: 5, maxProgress: 10 }
  ]
};

// Database save/load functions
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      // Migration: if the file is in the old flat single-user format, migrate it to the multi-user format
      if (parsed && parsed.userProfile && parsed.userProfile.email) {
        const email = parsed.userProfile.email.toLowerCase();
        return {
          [email]: {
            ...parsed,
            passwordHash: 'password123'
          }
        };
      }
      return parsed; // already dictionary format [email: string] -> UserData
    }
  } catch (error) {
    console.error('Error reading DB file:', error);
  }
  // Setup standard admin/owner default database with preloaded demo profile
  const initialData: any = {};
  const rootEmail = 'shivvamanognya@gmail.com';
  initialData[rootEmail] = {
    ...defaultData,
    passwordHash: 'password123'
  };
  return initialData;
}

function saveDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving DB file:', error);
  }
}

// Memory database loaded on startup
let database = loadDB();

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ywusbjoewizxxmdbruoc.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3dXNiam9ld2l6eHhtZGJydW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMTM4MjksImV4cCI6MjA5NTc4OTgyOX0.QAaKXTW6G6CuJMpgXvQY06qZHDWPIkBJ3bnikGANZm8';

// Connection status cache
interface SupabaseStatus {
  configured: boolean;
  connected: boolean;
  tableExists: boolean;
  error: string | null;
  projectUrl: string;
}

let supabaseStatus: SupabaseStatus = {
  configured: !!SUPABASE_URL && !!SUPABASE_ANON_KEY,
  connected: false,
  tableExists: false,
  error: null,
  projectUrl: SUPABASE_URL,
};

async function checkSupabaseConnection() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    supabaseStatus.configured = false;
    supabaseStatus.connected = false;
    supabaseStatus.tableExists = false;
    return;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/moneymate_data?select=email&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200 || response.status === 201) {
      supabaseStatus.configured = true;
      supabaseStatus.connected = true;
      supabaseStatus.tableExists = true;
      supabaseStatus.error = null;
      console.log('✅ Supabase connected successfully! moneymate_data table found.');
    } else {
      const data = await response.json().catch(() => ({}));
      if (data.code === 'PGRST116' || (data.message && data.message.includes('does not exist'))) {
        supabaseStatus.configured = true;
        supabaseStatus.connected = true;
        supabaseStatus.tableExists = false;
        supabaseStatus.error = 'moneymate_data table not found in Supabase database. Please run the SQL setup script.';
        console.warn('⚠️ Supabase connection OK, but moneymate_data table does not exist.');
      } else {
        supabaseStatus.connected = false;
        supabaseStatus.error = data.message || `HTTP ${response.status}`;
        console.error('❌ Supabase check returned status:', response.status, data);
      }
    }
  } catch (err: any) {
    supabaseStatus.connected = false;
    supabaseStatus.error = err.message || 'Network error';
    console.error('❌ Supabase network verification failed:', err);
  }
}

// Check initial connection
checkSupabaseConnection();

// Get user data from Supabase or fallback
async function getSupabaseUser(email: string) {
  const lowerEmail = email.toLowerCase();
  
  if (supabaseStatus.connected && supabaseStatus.tableExists) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/moneymate_data?email=eq.${encodeURIComponent(lowerEmail)}&select=*`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const rows = await response.json();
        if (rows && rows.length > 0) {
          return {
            source: 'supabase',
            user: rows[0]
          };
        }
      }
    } catch (err) {
      console.error(`Error querying Supabase for user ${lowerEmail}:`, err);
    }
  }
  
  // Local disk backup fallback
  if (database[lowerEmail]) {
    return {
      source: 'local',
      user: {
        email: lowerEmail,
        name: database[lowerEmail].userProfile?.name || 'User',
        password_hash: database[lowerEmail].passwordHash,
        data: database[lowerEmail]
      }
    };
  }
  return null;
}

// Persist user data to Supabase and fallback
async function saveSupabaseUser(email: string, name: string, passwordHash: string, data: any) {
  const lowerEmail = email.toLowerCase();
  
  // Always update local disk database as cache
  database[lowerEmail] = {
    ...data,
    passwordHash: passwordHash
  };
  saveDB(database);
  
  if (supabaseStatus.connected && supabaseStatus.tableExists) {
    try {
      // Check if user exists in Supabase
      const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/moneymate_data?email=eq.${encodeURIComponent(lowerEmail)}&select=email`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      const payload = {
        email: lowerEmail,
        name: name,
        password_hash: passwordHash,
        data: data,
        updated_at: new Date().toISOString()
      };
      
      let writeResponse;
      if (checkResponse.ok) {
        const rows = await checkResponse.json();
        if (rows && rows.length > 0) {
          // PATCH existing
          writeResponse = await fetch(`${SUPABASE_URL}/rest/v1/moneymate_data?email=eq.${encodeURIComponent(lowerEmail)}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
        } else {
          // POST insert
          writeResponse = await fetch(`${SUPABASE_URL}/rest/v1/moneymate_data`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
        }
      }
      
      if (writeResponse && writeResponse.ok) {
        console.log(`Saved user data for ${lowerEmail} to Supabase Cloud.`);
        return { success: true, source: 'supabase' };
      } else {
        const errText = writeResponse ? await writeResponse.text() : 'No response body';
        console.warn(`Supabase save response issue (using local fallback cache): ${errText}`);
        return { success: true, source: 'local' };
      }
    } catch (err) {
      console.error(`Network error writing to Supabase, fallback to disk:`, err);
      return { success: true, source: 'local' };
    }
  }
  
  return { success: true, source: 'local' };
}

// API: Supabase Connection Verification
app.get('/api/supabase/status', async (req, res) => {
  await checkSupabaseConnection();
  res.json(supabaseStatus);
});

// API: Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  const lowerEmail = email.toLowerCase();
  
  const existingRecord = await getSupabaseUser(lowerEmail);
  if (existingRecord) {
    const isDefaultUnchangedLocal = existingRecord.source === 'local' && 
      database[lowerEmail] &&
      database[lowerEmail].passwordHash === 'password123' &&
      database[lowerEmail].userProfile &&
      database[lowerEmail].userProfile.name === 'Shivva Manognya';

    if (!isDefaultUnchangedLocal) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }
  }

  // Create a clean, pristine dataset for this user without mock entries
  const newUserProfile = {
    name,
    email: lowerEmail,
    currency: 'INR',
    dailyStreak: 1,
    xp: 10,
    level: 1,
    enable2FA: false,
    theme: 'light'
  };

  const initialUserData = {
    transactions: [],
    budgets: [
      { category: 'Food', limit: 8000, spent: 0 },
      { category: 'Shopping', limit: 5000, spent: 0 },
      { category: 'Transport', limit: 4000, spent: 0 },
      { category: 'Entertainment', limit: 3000, spent: 0 },
      { category: 'Education', limit: 6000, spent: 0 },
      { category: 'Healthcare', limit: 4000, spent: 0 },
      { category: 'Bills', limit: 15000, spent: 0 },
      { category: 'Investments', limit: 10000, spent: 0 },
      { category: 'Other', limit: 3000, spent: 0 }
    ],
    savingGoals: [],
    recurringTransactions: [],
    splitExpenses: [],
    debts: [],
    investments: [],
    userProfile: newUserProfile,
    notifications: [
      { id: 'n1', title: 'Welcome to MoneyMate', message: 'Registry initiated and cloud-synced! Add your first transactions to begin.', type: 'success', date: '2026-05-31', read: false }
    ],
    badges: [
      { id: 'b1', name: 'Starter Tracker', description: 'Created your first expense log', category: 'general', unlocked: false, progress: 0, maxProgress: 1 },
      { id: 'b2', name: 'Savings Guru', description: 'Save a total of ₹50,000 across savings goals', category: 'savings', unlocked: false, progress: 0, maxProgress: 50000 },
      { id: 'b3', name: 'Budget Warrior', description: 'Maintain expense category spending under limits for 30 consecutive days', category: 'budget', unlocked: false, progress: 0, maxProgress: 30 },
      { id: 'b4', name: 'Active Investor', description: 'Register at least three investment classes', category: 'invest', unlocked: false, progress: 0, maxProgress: 3 },
      { id: 'b5', name: 'Consistency King', description: 'Maintain a 10-day entries streak', category: 'streak', unlocked: false, progress: 1, maxProgress: 10 }
    ]
  };

  const saveResult = await saveSupabaseUser(lowerEmail, name, password, initialUserData);
  res.json({ success: true, user: newUserProfile, source: saveResult.source });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  const lowerEmail = email.toLowerCase();
  
  let userRecord = await getSupabaseUser(lowerEmail);
  
  if (!userRecord) {
    // If user is shivvamanognya@gmail.com, we can auto-register them
    if (lowerEmail === 'shivvamanognya@gmail.com') {
      const initialUserData = {
        ...defaultData,
        userProfile: {
          ...defaultData.userProfile,
          email: lowerEmail
        }
      };
      const saveResult = await saveSupabaseUser(lowerEmail, 'Shivva Manognya', 'password123', initialUserData);
      userRecord = {
        source: saveResult.source,
        user: {
          email: lowerEmail,
          name: 'Shivva Manognya',
          password_hash: 'password123',
          data: initialUserData
        }
      };
    } else {
      return res.status(400).json({ success: false, message: 'No registered account found with this email.' });
    }
  }

  const userData = userRecord.user;
  if (userData.password_hash !== password) {
    return res.status(400).json({ success: false, message: 'Incorrect passcode. Try again.' });
  }

  const userPayloadData = userData.data || {};
  const profile = userPayloadData.userProfile || {
    name: userData.name || 'User',
    email: lowerEmail,
    currency: 'INR',
    dailyStreak: 5,
    xp: 350,
    level: 3,
    enable2FA: false,
    theme: 'light'
  };

  res.json({ success: true, user: profile, source: userRecord.source });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email } = req.body;
  res.json({ success: true, message: `Password reset instructions sent to ${email}` });
});

app.get('/api/user/data', async (req, res) => {
  const email = (req.query.email as string)?.toLowerCase();
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email context is required.' });
  }
  
  const userRecord = await getSupabaseUser(email);
  if (!userRecord) {
    return res.status(404).json({ success: false, message: 'User database record not found.' });
  }
  
  let userDataToReturn = userRecord.user.data;
  if (!userDataToReturn || Object.keys(userDataToReturn).length === 0) {
    const freshProfile = {
      name: userRecord.user.name || 'User',
      email: email,
      currency: 'INR',
      dailyStreak: 1,
      xp: 10,
      level: 1,
      enable2FA: false,
      theme: 'light'
    };
    
    userDataToReturn = {
      transactions: [],
      budgets: [
        { category: 'Food', limit: 8005, spent: 0 },
        { category: 'Shopping', limit: 5000, spent: 0 },
        { category: 'Transport', limit: 4000, spent: 0 },
        { category: 'Entertainment', limit: 3000, spent: 0 },
        { category: 'Education', limit: 6000, spent: 0 },
        { category: 'Healthcare', limit: 4000, spent: 0 },
        { category: 'Bills', limit: 15000, spent: 0 },
        { category: 'Investments', limit: 10000, spent: 0 },
        { category: 'Other', limit: 3000, spent: 0 }
      ],
      savingGoals: [],
      recurringTransactions: [],
      splitExpenses: [],
      debts: [],
      investments: [],
      userProfile: freshProfile,
      notifications: [
        { id: 'n1', title: 'Welcome to MoneyMate', message: 'Registry initiated! Add your first transactions to begin.', type: 'success', date: new Date().toISOString().split('T')[0], read: false }
      ],
      badges: [
        { id: 'b1', name: 'Starter Tracker', description: 'Created your first expense log', category: 'general', unlocked: false, progress: 0, maxProgress: 1 },
        { id: 'b2', name: 'Savings Guru', description: 'Save a total of ₹50,000 across savings goals', category: 'savings', unlocked: false, progress: 0, maxProgress: 50000 },
        { id: 'b3', name: 'Budget Warrior', description: 'Maintain spending under limits', category: 'budget', unlocked: false, progress: 0, maxProgress: 30 }
      ]
    };
    
    await saveSupabaseUser(email, userRecord.user.name || 'User', userRecord.user.password_hash || 'password123', userDataToReturn);
  }
  
  res.json(userDataToReturn);
});

app.post('/api/user/data', async (req, res) => {
  const email = (req.body.userProfile?.email as string)?.toLowerCase();
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email context is required in payload.' });
  }
  
  const userRecord = await getSupabaseUser(email);
  const passwordHash = userRecord ? userRecord.user.password_hash : 'password123';
  const name = req.body.userProfile?.name || (userRecord ? userRecord.user.name : 'User');
  
  const saveResult = await saveSupabaseUser(email, name, passwordHash, req.body);
  res.json({ success: true, message: 'Data persisted successfully.', source: saveResult.source });
});

// AI Insights using @google/genai SDK
app.post('/api/ai/insights', async (req, res) => {
  const { transactions, budgets, currency } = req.body;
  if (!apiKey) {
    return res.json({
      success: false,
      message: "Please configure your GEMINI_API_KEY inside the secrets panel to activate full AI Insights."
    });
  }

  try {
    const expenses = transactions.filter((t: any) => t.type === 'expense');
    const incomes = transactions.filter((t: any) => t.type === 'income');

    const totalIncome = incomes.reduce((acc: number, item: any) => acc + item.amount, 0);
    const totalExpense = expenses.reduce((acc: number, item: any) => acc + item.amount, 0);

    const expenseSummary = expenses.slice(0, 10).map((e: any) => `${e.category}: ${currency} ${e.amount} (${e.notes || ''})`).join('\n');
    const budgetSummary = budgets.map((b: any) => `${b.category}: Limit: ${currency} ${b.limit}, Spent: ${currency} ${b.spent}`).join('\n');

    const prompt = `You are an expert AI financial analyst and advisor. Based on this user's monthly finance breakdown, perform an assessment:
Total Income: ${currency} ${totalIncome}
Total Expenses: ${currency} ${totalExpense}

Recent Expenses logged:
${expenseSummary}

Categories Budget limits and actual spend:
${budgetSummary}

Structure your response strictly in 5 distinct formatted JSON fields.
Do not include any extra character outside the valid JSON object body:
{
  "summary": "overall evaluation and short general health overview",
  "insights": ["Specific insight 1", "Specific insight 2", "Specific insight 3"],
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"],
  "predictions": "Next month spending estimation based on current trajectory",
  "nextMonthEstimate": "Integer estimation e.g. 24000"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    });

    const text = response.text || '{}';
    const insightsData = JSON.parse(text);
    res.json({ success: true, data: insightsData });
  } catch (error: any) {
    console.error('Gemini Insights error:', error);
    res.json({ success: false, error: error.message });
  }
});

// AI Chatbot Companion / Advising Session
app.post('/api/ai/chat', async (req, res) => {
  const { message, history, finances, currency } = req.body;
  if (!apiKey) {
    return res.json({
      reply: "Hi! I am your MoneyMate AI Advisor. Please configure your `GEMINI_API_KEY` in settings to chat with me using live intelligence. In the meantime, I can tell you that keeping an emergency fund of 6 months of expenses is an excellent starting point!"
    });
  }

  try {
    const systemPrompt = `You are a friendly, wise, and proactive AI Financial Advisor for MoneyMate.
The user is asking questions about savings, budgeting, investments, debt management, or general wealth building.
Be encouraging, professional, and practical. Do not use hyperbole. Reference their actual financial standing when offering advise.

User Current Financial Standing:
- Currency: ${currency}
- Total Income logged: ${currency} ${finances.income}
- Total Expenses logged: ${currency} ${finances.expense}
- Total Net Balance: ${currency} ${finances.balance}
- Current Active Goals progress: ${finances.goalsCount} goals, active investments valued: ${currency} ${finances.investmentsTotal}

Keep your responses supportive and clear. Use bullet-points where helpful. Always use markdown formatting.`;

    const chatHistory = history.map((h: any) => ({
      role: h.role, // 'user' or 'model'
      parts: [{ text: h.content }]
    }));

    // Add current user prompt
    chatHistory.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: chatHistory,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7
      }
    });

    res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.error('Gemini Advisor Chats error:', error);
    res.json({ success: false, error: error.message });
  }
});

// AI Categorize
app.post('/api/ai/categorize', async (req, res) => {
  const { description } = req.body;
  if (!apiKey) {
    return res.json({ category: 'Other' });
  }

  try {
    const prompt = `Return the best transaction expense category matching description: "${description}".
Choose exactly and strictly ONE from standard categories:
"Food", "Shopping", "Transport", "Entertainment", "Education", "Healthcare", "Bills", "Investments", "Other".

Response must be raw text containing exactly the category name, nothing else.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.1
      }
    });

    const category = response.text?.trim() || 'Other';
    res.json({ success: true, category });
  } catch (err) {
    res.json({ success: false, category: 'Other' });
  }
});

// AI Voice Entry Transcript Processor
app.post('/api/ai/voice-entry', async (req, res) => {
  const { speechText } = req.body;
  if (!apiKey) {
    return res.json({
      success: false,
      message: 'Gemini API not configured. Please use manual entry.'
    });
  }

  try {
    const prompt = `Translate the following transaction voice-to-text input into a structured transaction JSON payload.
Input text: "${speechText}"

Return a JSON object matching this structure:
{
  "amount": number,
  "type": "income" | "expense",
  "category": "Food" | "Shopping" | "Transport" | "Entertainment" | "Education" | "Healthcare" | "Bills" | "Investments" | "Other" (for income types like Salary, Gifts, Freelancing, use "Other" or best fits),
  "notes": "short details of what it is",
  "date": "YYYY-MM-DD" (use 2026-05-31 if not mentioned, or match context)
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    res.json({ success: false, error: error.message });
  }
});

// AI OCR Receipt Processor
app.post('/api/ai/ocr-receipt', async (req, res) => {
  const { base64Image } = req.body; // Expects "data:image/png;base64,xxxx"
  if (!apiKey) {
    return res.json({
      success: false,
      message: 'Gemini API not configured. Attach API key to scan receipts with machine vision!'
    });
  }

  try {
    // Strip headers if any
    const base64DataOnly = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    const mimeType = base64Image.includes('image/jpeg') ? 'image/jpeg' : 'image/png';

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64DataOnly
      }
    };

    const textPart = {
      text: `Analyze this image of a payment receipt or invoice. Extract the total purchase amount, a category fitting standard ledger itemization (Food, Shopping, Transport, Entertainment, Education, Healthcare, Bills, Investments, Other), a description of what was purchased (notes), and the date of transaction.
Return the result strictly as a JSON object:
{
  "amount": number (float/integer),
  "category": "Food" | "Shopping" | "Transport" | "Entertainment" | "Education" | "Healthcare" | "Bills" | "Investments" | "Other",
  "notes": "Merchant/items list summary",
  "date": "YYYY-MM-DD"
}`
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('OCR receipt error:', error);
    res.json({ success: false, error: error.message });
  }
});

// Vite server asset rendering setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MoneyMate Server running on http://localhost:${PORT}`);
  });
}

startServer();
