'use client';

import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('dark-mode') === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  function toggle() {
    const next = !dark;
    setDark(next);
    localStorage.setItem('dark-mode', String(next));
    document.documentElement.classList.toggle('dark', next);
  }

  return (
    <button onClick={toggle} className="text-xl" aria-label="Toggle dark mode">
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
