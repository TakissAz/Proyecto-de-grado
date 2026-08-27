import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'nutrigo-theme';

// Lee el estado inicial del tema desde el DOM (ya aplicado por el script inline en <head>)
function temaInicial(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(temaInicial);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar tema"
      className="flex h-[34px] w-[34px] items-center justify-center rounded-full border
        border-surface-border bg-surface-card text-ink-muted transition-colors hover:text-ink
        dark:border-surface-border-dark dark:bg-surface-card-dark dark:text-ink-muted-dark
        dark:hover:text-ink-dark"
    >
      {isDark ? <Moon size={16} strokeWidth={1.8} /> : <Sun size={16} strokeWidth={1.8} />}
    </button>
  );
}
