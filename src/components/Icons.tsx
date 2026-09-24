import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({ width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...p });

export const IconPlay = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5Z" /></svg>
);
export const IconCheck = (p: P) => <svg {...base(p)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
export const IconDoc = (p: P) => (
  <svg {...base(p)}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>
);
export const IconDownload = (p: P) => <svg {...base(p)}><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" /></svg>;
export const IconClock = (p: P) => <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
export const IconChevron = (p: P) => <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>;
export const IconArrowLeft = (p: P) => <svg {...base(p)}><path d="M19 12H5m0 0 6-6m-6 6 6 6" /></svg>;
export const IconArrowRight = (p: P) => <svg {...base(p)}><path d="M5 12h14m0 0-6-6m6 6-6 6" /></svg>;
export const IconList = (p: P) => <svg {...base(p)}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
export const IconBook = (p: P) => (
  <svg {...base(p)}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19a2 2 0 0 0 2 2h13" /></svg>
);
export const IconShield = (p: P) => <svg {...base(p)}><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" /><path d="m9.5 12 2 2 3.5-4" /></svg>;
export const IconMail = (p: P) => <svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
export const IconBolt = (p: P) => <svg {...base(p)} fill="currentColor" stroke="none"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg>;
