import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default function EstadoPage() {
  const mensaje = env().ESTADO_MENSAJE;
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs uppercase tracking-[0.3em] text-gold-dark">AG Academy</p>
      <h1 className="mt-2 text-2xl font-semibold">Estado del servicio</h1>

      {mensaje ? (
        <div className="mt-6 rounded-xl border border-gold bg-white p-5">
          <p className="font-medium">{mensaje}</p>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-navy/10 bg-white p-5">
          <p className="font-medium">No tenemos incidencias registradas ahora mismo.</p>
        </div>
      )}

      <section className="mt-8 space-y-4 text-sm leading-relaxed text-navy/80">
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
          <a href="https://hayahora.futbol" target="_blank" rel="noopener noreferrer" className="text-gold-dark underline">hayahora.futbol</a>.
        </p>
        <p>
          <a href="/acceso" className="inline-block rounded-lg bg-navy px-4 py-2 font-medium text-white hover:bg-navy-soft">Entrar en el aula</a>
        </p>
      </section>
    </main>
  );
}
