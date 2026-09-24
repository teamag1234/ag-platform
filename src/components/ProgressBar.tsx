export function ProgressBar({ value, className = '', light = false }: { value: number; className?: string; light?: boolean }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full ${light ? 'bg-white/15' : 'bg-navy/10'} ${className}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-dark transition-[width] duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 64, stroke = 6, light = false }: { value: number; size?: number; stroke?: number; light?: boolean }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} aria-label={`${pct}% completado`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className={light ? 'stroke-white/15' : 'stroke-navy/10'} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke="#ffbd59" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} className="transition-[stroke-dashoffset] duration-700" />
      </svg>
      <span className={`absolute text-sm font-semibold ${light ? 'text-white' : 'text-navy'}`}>{pct}%</span>
    </div>
  );
}
