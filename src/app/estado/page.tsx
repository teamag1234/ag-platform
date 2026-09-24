import { env } from '@/lib/env';
import { Logo } from '@/components/Logo';
import { IconArrowRight } from '@/components/Icons';

export const dynamic = 'force-dynamic';

export default function EstadoPage() {
  const mensaje = env().ESTADO_MENSAJE;
  return (
    <main className="min-h-screen">
      <header className="ag-hero">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <Logo width={130} priority />
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="ag-eyebrow">Aula</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Estado del servicio</h1>

        <div className={`ag-card mt-6 flex items-center gap-4 p-5 ${mensaje ? 'border-gold bg-gold-soft/40' : ''}`}>
          <span className={`h-3 w-3 shrink-0 rounded-full ${mensaje ? 'bg-gold' : 'bg-emerald-500'}`} />
          <p className="font-medium">{mensaje ?? 'Todo funciona con normalidad.'}</p>
        </div>

        <section className="ag-card mt-6 space-y-4 p-6 text-sm leading-relaxed text-ink/80 sm:p-8">
          <h2 className="text-base font-semibold text-navy">¿La plataforma no carga durante un partido de fútbol?</h2>
          <p>
            Durante los partidos de LaLiga, las compañías de internet españolas cortan el acceso a miles de webs que no tienen nada que ver
            con el fútbol. Puede afectar a nuestra web principal. No es un fallo tuyo ni nuestro.
          </p>
          <p>
            Esta aula está en un servidor propio que no se ve afectado por esos cortes. Si aun así algo no carga, activa una VPN gratuita
            como Proton VPN mientras dure el partido y vuelve a intentarlo.
          </p>
          <p>
            Puedes comprobar si hay un bloqueo activo en{' '}
            <a href="https://hayahora.futbol" target="_blank" rel="noopener noreferrer" className="text-gold-dark underline underline-offset-2">hayahora.futbol</a>.
          </p>
          <a href="/acceso" className="ag-btn ag-btn-dark">
            Entrar en el aula <IconArrowRight width={18} height={18} />
          </a>
        </section>
      </div>
    </main>
  );
}
