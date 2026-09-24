import Link from 'next/link';
import { requireStudent } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function AulaLayout({ children }: { children: React.ReactNode }) {
  const student = await requireStudent();
  return (
    <div className="min-h-screen">
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/mis-cursos" className="flex items-baseline gap-2">
            <span className="text-xs uppercase tracking-[0.3em] text-gold">AG Academy</span>
            <span className="font-semibold">Aula</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-white/70 sm:inline">{student.name ?? student.email}</span>
            <form action="/salir" method="post">
              <button className="rounded-md border border-white/20 px-3 py-1.5 text-white/90 hover:bg-white/10">Salir</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
