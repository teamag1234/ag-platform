import { redirect } from 'next/navigation';
import { getCurrentStudent } from '@/lib/auth/session';
import { AccesoForm } from './AccesoForm';

export const dynamic = 'force-dynamic';

const ERRORS: Record<string, string> = {
  expired: 'Ese enlace ha caducado. Pide uno nuevo.',
  used: 'Ese enlace ya se ha usado. Pide uno nuevo.',
  invalid: 'Ese enlace no es válido. Pide uno nuevo.',
};

export default async function AccesoPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const student = await getCurrentStudent();
  if (student) redirect('/mis-cursos');
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">AG Academy</p>
          <h1 className="mt-2 text-3xl font-semibold">Entrar en el aula</h1>
        </div>
        <div className="rounded-2xl bg-paper p-6 shadow-xl">
          {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{ERRORS[error] ?? ERRORS.invalid}</p>}
          <AccesoForm />
        </div>
        <p className="mt-6 text-center text-xs text-white/60">
          ¿Problemas para entrar? <a className="underline" href="/estado">Mira el estado del servicio</a>.
        </p>
      </div>
    </main>
  );
}
