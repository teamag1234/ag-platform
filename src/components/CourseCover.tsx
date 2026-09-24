const PALETTES = [
  ['#0a0e27', '#1a2a4a'],
  ['#141a3d', '#2b3a6b'],
  ['#0f1b3a', '#1e3a5f'],
  ['#1a1440', '#3b2a7a'],
];

function hash(s: string) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** Portada del curso: imagen si existe; si no, un degradado navy con las iniciales y un detalle dorado. */
export function CourseCover({ title, imageUrl, className = '' }: { title: string; imageUrl: string | null; className?: string }) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt="" className={`h-full w-full object-cover ${className}`} />;
  }
  const [a, b] = PALETTES[hash(title) % PALETTES.length];
  const words = title.split(/\s+/).filter(Boolean);
  const mark = (words.length > 1 ? words[0][0] + words[1][0] : title.slice(0, 2)).toUpperCase();
  return (
    <div className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} aria-hidden>
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/20 blur-2xl" />
      <div className="absolute -bottom-12 -left-6 h-36 w-36 rounded-full bg-white/5 blur-xl" />
      <span className="relative text-4xl font-bold tracking-tight text-white/90">{mark}</span>
      <span className="absolute bottom-3 left-4 ag-eyebrow ag-eyebrow-light">AG Academy</span>
    </div>
  );
}
