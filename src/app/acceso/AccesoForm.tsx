'use client';

import { useActionState } from 'react';
import { solicitarAcceso, type AccesoState } from './actions';

export function AccesoForm() {
  const [state, action, pending] = useActionState<AccesoState, FormData>(solicitarAcceso, { status: 'idle' });

  if (state.status === 'sent') {
    return (
      <div className="rounded-xl border border-gold/60 bg-white p-6">
        <h2 className="text-lg font-semibold">Revisa tu correo</h2>
        <p className="mt-2 text-sm text-navy/80">
          Si <strong>{state.email}</strong> es el email con el que compraste, te hemos enviado un enlace para entrar. Caduca en 20 minutos.
          Mira también en spam o promociones.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Tu email de alumno</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="nombre@ejemplo.com"
          className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-4 py-3 outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
        />
      </label>
      {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-gold px-4 py-3 font-semibold text-navy transition hover:bg-gold-dark disabled:opacity-60"
      >
        {pending ? 'Enviando…' : 'Enviarme el enlace de acceso'}
      </button>
      <p className="text-xs text-navy/60">Sin contraseñas. Te mandamos un enlace al email con el que compraste el curso.</p>
    </form>
  );
}
