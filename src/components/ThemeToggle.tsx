import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onChange: (theme: 'light' | 'dark') => void;
}

export default function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  return (
    <button
      id="theme-toggle-btn"
      onClick={() => onChange(theme === 'light' ? 'dark' : 'light')}
      className="p-2 rounded-lg cursor-pointer bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" id="moon-icon" />
      ) : (
        <Sun className="w-5 h-5" id="sun-icon" />
      )}
    </button>
  );
}
