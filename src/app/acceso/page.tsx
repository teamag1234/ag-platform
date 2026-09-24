import { redirect } from 'next/navigation';
import { getCurrentStudent } from '@/lib/auth/session';
import { AccesoForm } from './AccesoForm';
import { Logo } from '@/components/Logo';
import { IconBolt, IconMail, IconShield } from '@/components/Icons';

export const dynamic = 'force-dynamic';

const ERRORS: Record<string, string> = {
  expired: 'Ese enlace ha caducado. Pide uno nuevo.',
  used: 'Ese enlace ya se ha usado. Pide uno nuevo.',
  invalid: 'Ese enlace no es válido. Pide uno nuevo.',
};

const CLAIMS = [
  { icon: IconMail, title: 'Sin contraseñas', text: 'Te enviamos un enlace a tu email y entras. Nada que recordar.' },
  { icon: IconBolt, title: 'Funciona en jornadas de fútbol', text: 'El aula está en un servidor propio, fuera de los bloqueos de LaLiga.' },
  { icon: IconShield, title: 'Tu progreso, guardado', text: 'Retoma cada lección donde la dejaste, en móvil o en ordenador.' },
];

export default async function AccesoPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const student = await getCurrentStudent();
  if (student) redirect('/mis-cursos');
  const { error } = await searchParams;

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[1.1fr_1fr]">
      <section className="ag-hero relative flex flex-col justify-between px-6 py-8 text-white sm:px-10 lg:px-14 lg:py-12">
        <Logo width={150} priority />
        <div className="my-12 max-w-md lg:my-0">
          <p className="ag-eyebrow ag-eyebrow-light">La autoescuela del APTIS</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Tu aula, siempre disponible.</h1>
          <ul className="mt-8 space-y-5">
            {CLAIMS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gold">
                  <Icon width={20} height={20} />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-sm text-white/70">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="hidden text-xs text-white/50 lg:block">© AG Academy · Always Growing Academy SL</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold tracking-tight">Entrar en el aula</h2>
          <p className="mt-1 text-sm text-muted">Escribe el email con el que compraste el curso.</p>
          <div className="ag-card mt-6 p-6 sm:p-7">
            {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{ERRORS[error] ?? ERRORS.invalid}</p>}
            <AccesoForm />
          </div>
          <p className="mt-6 text-center text-xs text-muted">
            ¿Problemas para entrar? <a className="underline underline-offset-2 hover:text-navy" href="/estado">Mira el estado del servicio</a>
          </p>
        </div>
      </section>
    </main>
  );
}
