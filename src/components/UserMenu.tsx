'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { IconChevron } from './Icons';

export function UserMenu({ name, email, initials }: { name: string | null; email: string; initials: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-white/15 py-1 pl-1 pr-3 text-sm text-white/90 transition hover:bg-white/10"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy">{initials}</span>
        <span className="hidden max-w-[160px] truncate sm:inline">{name ?? email}</span>
        <IconChevron width={16} height={16} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-white text-navy shadow-lift">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold">{name ?? 'Alumno'}</p>
            <p className="truncate text-xs text-muted">{email}</p>
          </div>
          <Link href="/mis-cursos" role="menuitem" className="block px-4 py-2.5 text-sm hover:bg-paper" onClick={() => setOpen(false)}>
            Mis cursos
          </Link>
          <Link href="/estado" role="menuitem" className="block px-4 py-2.5 text-sm hover:bg-paper" onClick={() => setOpen(false)}>
            Estado del servicio
          </Link>
          <form action="/salir" method="post" className="border-t border-line">
            <button type="submit" role="menuitem" className="block w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-paper">
              Salir
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
