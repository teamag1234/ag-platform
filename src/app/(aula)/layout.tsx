import Link from 'next/link';
import { requireStudent } from '@/lib/auth/session';
import { Logo } from '@/components/Logo';
import { UserMenu } from '@/components/UserMenu';
import { initials } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AulaLayout({ children }: { children: React.ReactNode }) {
  const student = await requireStudent();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-navy/95 text-white shadow-[0_1px_0_rgba(255,255,255,0.06),0_8px_24px_-16px_rgba(0,0,0,0.6)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/mis-cursos" className="flex items-center gap-3" aria-label="Mis cursos">
            <Logo width={112} priority />
            <span className="hidden border-l border-white/15 pl-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold sm:inline">Aula</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/mis-cursos" className="hidden rounded-full px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white md:inline">
              Mis cursos
            </Link>
            <UserMenu name={student.name} email={student.email} initials={initials(student.name, student.email)} />
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-line py-6 text-center text-xs text-muted">
        AG Academy · La autoescuela del APTIS ·{' '}
        <Link href="/estado" className="underline-offset-2 hover:underline">
          Estado del servicio
        </Link>
      </footer>
    </div>
  );
}
