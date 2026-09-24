'use client';

import { useActionState } from 'react';
import { solicitarAcceso, type AccesoState } from './actions';
import { IconMail } from '@/components/Icons';

export function AccesoForm() {
  const [state, action, pending] = useActionState<AccesoState, FormData>(solicitarAcceso, { status: 'idle' });

  if (state.status === 'sent') {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
          <IconMail width={26} height={26} />
        </span>
        <h3 className="mt-4 text-lg font-semibold">Revisa tu correo</h3>
        <p className="mt-2 text-sm text-muted">
          Si <strong className="text-navy">{state.email}</strong> es el email con el que compraste, te hemos enviado un enlace para entrar. Caduca en 20 minutos.
        </p>
        <p className="mt-3 text-xs text-muted">Mira también en spam o promociones.</p>
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
          autoFocus
          placeholder="nombre@ejemplo.com"
          className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-base outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/25"
        />
      </label>
      {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="ag-btn ag-btn-primary w-full">
        {pending ? 'Enviando…' : 'Enviarme el enlace de acceso'}
      </button>
      <p className="text-center text-xs text-muted">Sin contraseñas. Te mandamos un enlace de un solo uso.</p>
    </form>
  );
}
