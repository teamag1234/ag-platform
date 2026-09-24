'use client';

import Link from 'next/link';
import { useState } from 'react';
import { IconCheck, IconChevron, IconDoc, IconDownload, IconList, IconPlay } from './Icons';
import { ProgressBar } from './ProgressBar';

export type SidebarLesson = { id: string; slug: string; title: string; kind: 'video' | 'texto' | 'material'; duration: string | null; done: boolean };
export type SidebarModule = { id: string; title: string; lessons: SidebarLesson[] };

type Props = { courseSlug: string; courseTitle: string; modules: SidebarModule[]; currentSlug: string; done: number; total: number };

function KindIcon({ kind, className }: { kind: SidebarLesson['kind']; className?: string }) {
  if (kind === 'video') return <IconPlay width={12} height={12} className={className} />;
  if (kind === 'texto') return <IconDoc width={14} height={14} className={className} />;
  return <IconDownload width={14} height={14} className={className} />;
}

function Outline({ courseSlug, courseTitle, modules, currentSlug, done, total, onNavigate }: Props & { onNavigate?: () => void }) {
  const pct = total ? (done / total) * 100 : 0;
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-5 py-4">
        <Link href={`/cursos/${courseSlug}`} className="text-sm font-semibold text-navy hover:underline" onClick={onNavigate}>
          {courseTitle}
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <ProgressBar value={pct} className="flex-1" />
          <span className="text-xs font-medium text-muted">{Math.round(pct)}%</span>
        </div>
        <p className="mt-1 text-xs text-muted">
          {done} de {total} lecciones completadas
        </p>
      </div>
      <nav className="ag-scroll flex-1 overflow-y-auto py-2" aria-label="Contenido del curso">
        {modules.map((m, i) => {
          const isCurrent = m.lessons.some((l) => l.slug === currentSlug);
          const mDone = m.lessons.filter((l) => l.done).length;
          return (
            <details key={m.id} className="ag-module" open={isCurrent}>
              <summary className="flex items-center gap-3 px-5 py-3 hover:bg-paper">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-[11px] font-semibold text-white">{i + 1}</span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold leading-tight text-navy">{m.title}</span>
                  <span className="block text-[11px] text-muted">
                    {mDone} de {m.lessons.length}
                  </span>
                </span>
                <IconChevron width={16} height={16} className="ag-chevron text-muted" />
              </summary>
              <ol className="pb-2">
                {m.lessons.map((l) => {
                  const active = l.slug === currentSlug;
                  return (
                    <li key={l.id}>
                      <Link
                        href={`/cursos/${courseSlug}/${l.slug}`}
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-3 py-2 pl-5 pr-4 text-sm transition ${active ? 'border-r-2 border-gold bg-gold-soft/60 font-medium text-navy' : 'text-ink/80 hover:bg-paper'}`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${l.done ? 'bg-gold text-navy' : active ? 'bg-navy text-white' : 'border border-line text-muted'}`}>
                          {l.done ? <IconCheck width={12} height={12} strokeWidth={3} /> : <KindIcon kind={l.kind} />}
                        </span>
                        <span className="flex-1 leading-snug">{l.title}</span>
                        {l.duration && <span className="text-[11px] text-muted">{l.duration}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </details>
          );
        })}
      </nav>
    </div>
  );
}

export function LessonSidebar(props: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Escritorio */}
      <aside className="ag-card sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-hidden lg:block">
        <Outline {...props} />
      </aside>

      {/* Móvil: botón + panel deslizante */}
      <div className="lg:hidden">
        <button type="button" onClick={() => setOpen(true)} className="ag-btn ag-btn-ghost ag-btn-sm w-full justify-between">
          <span className="flex items-center gap-2">
            <IconList width={16} height={16} /> Contenido del curso
          </span>
          <span className="text-xs text-muted">
            {props.done}/{props.total}
          </span>
        </button>
        {open && (
          <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Contenido del curso">
            <button type="button" aria-label="Cerrar" className="flex-1 bg-navy/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div className="flex h-full w-[86%] max-w-sm flex-col bg-white shadow-lift">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <span className="text-sm font-semibold">Contenido del curso</span>
                <button type="button" onClick={() => setOpen(false)} className="rounded-full px-3 py-1 text-sm text-muted hover:bg-paper">
                  Cerrar
                </button>
              </div>
              <div className="min-h-0 flex-1">
                <Outline {...props} onNavigate={() => setOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
