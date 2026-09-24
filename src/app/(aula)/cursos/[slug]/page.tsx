import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireStudent } from '@/lib/auth/session';
import { getCourseBySlug, getCourseOutline, getProgressSet, hasActiveGrant, nextLesson, totalDuration } from '@/lib/aula';
import { thumbnailUrl } from '@/lib/bunny';
import { CourseCover } from '@/components/CourseCover';
import { ProgressBar } from '@/components/ProgressBar';
import { LessonThumb } from '@/components/LessonThumb';
import { IconArrowLeft, IconArrowRight, IconCheck, IconClock } from '@/components/Icons';
import { formatDuration, lessonKind } from '@/lib/format';

export const dynamic = 'force-dynamic';

const KIND_LABEL = { video: 'Vídeo', texto: 'Lectura', material: 'Material' } as const;

export default async function CursoPage({ params }: { params: Promise<{ slug: string }> }) {
  const student = await requireStudent();
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course || !course.published) notFound();
  if (!(await hasActiveGrant(student.id, course.id))) redirect('/mis-cursos?sin-acceso=1');

  const [outline, done] = await Promise.all([getCourseOutline(course.id), getProgressSet(student.id, course.id)]);
  const total = outline.reduce((n, m) => n + m.lessons.length, 0);
  const pct = total ? Math.round((done.size / total) * 100) : 0;
  const next = nextLesson(outline, done);
  const duration = formatDuration(totalDuration(outline));

  return (
    <div>
      <section className="ag-hero text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <Link href="/mis-cursos" className="inline-flex items-center gap-1.5 text-sm text-white/70 transition hover:text-white">
            <IconArrowLeft width={16} height={16} /> Mis cursos
          </Link>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center">
            <div>
              <p className="ag-eyebrow ag-eyebrow-light">Curso</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{course.title}</h1>
              {course.description && <p className="mt-3 max-w-2xl text-white/75">{course.description}</p>}
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-white/80">
                <span className="rounded-full bg-white/10 px-3 py-1">{outline.length} módulos</span>
                <span className="rounded-full bg-white/10 px-3 py-1">{total} lecciones</span>
                {duration && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                    <IconClock width={13} height={13} /> {duration}
                  </span>
                )}
              </div>
              <div className="mt-6 flex items-center gap-3">
                <ProgressBar value={pct} className="max-w-sm" light />
                <span className="text-sm font-medium">{pct}%</span>
              </div>
              {next && (
                <Link href={`/cursos/${course.slug}/${next.slug}`} className="ag-btn ag-btn-primary mt-6">
                  {done.size === 0 ? 'Empezar el curso' : pct === 100 ? 'Repasar desde el inicio' : 'Continuar'}
                  <IconArrowRight width={18} height={18} />
                </Link>
              )}
              {next && done.size > 0 && pct < 100 && <p className="mt-2 text-xs text-white/60">Siguiente: {next.title}</p>}
            </div>
            <div className="hidden h-52 overflow-hidden rounded-2xl shadow-lift lg:block">
              <CourseCover title={course.title} imageUrl={course.thumbnailUrl} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="ag-eyebrow">Contenido</p>
            <h2 className="mt-1 text-xl font-semibold">Programa del curso</h2>
          </div>
          <p className="text-sm text-muted">
            {done.size} de {total} completadas
          </p>
        </div>

        <div className="mt-6 space-y-5">
          {outline.map((m, i) => {
            const mDone = m.lessons.filter((l) => done.has(l.id)).length;
            const complete = m.lessons.length > 0 && mDone === m.lessons.length;
            return (
              <section key={m.id} className="ag-card overflow-hidden">
                <header className="flex items-center gap-4 border-b border-line px-5 py-4 sm:px-6">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${complete ? 'bg-gold text-navy' : 'bg-navy text-white'}`}>
                    {complete ? <IconCheck width={16} height={16} strokeWidth={3} /> : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold leading-tight">{m.title}</h3>
                    {m.description && <p className="mt-0.5 text-sm text-muted">{m.description}</p>}
                  </div>
                  <span className="shrink-0 text-xs font-medium text-muted">
                    {mDone}/{m.lessons.length}
                  </span>
                </header>
                <ol className="divide-y divide-line">
                  {m.lessons.map((l) => {
                    const kind = lessonKind(l);
                    const isDone = done.has(l.id);
                    const isNext = next?.id === l.id;
                    const dur = formatDuration(l.durationSeconds);
                    return (
                      <li key={l.id}>
                        <Link href={`/cursos/${course.slug}/${l.slug}`} className="flex items-center gap-4 px-5 py-3 transition hover:bg-paper sm:px-6">
                          <LessonThumb kind={kind} imageUrl={l.bunnyVideoId ? thumbnailUrl(l.bunnyVideoId) : null} done={isDone} />
                          <div className="min-w-0 flex-1">
                            <p className={`truncate font-medium ${isDone ? 'text-muted' : ''}`}>{l.title}</p>
                            <p className="mt-0.5 text-xs text-muted">
                              {KIND_LABEL[kind]}
                              {dur && ` · ${dur}`}
                              {l.attachments.length > 0 && ` · ${l.attachments.length} ${l.attachments.length === 1 ? 'archivo' : 'archivos'}`}
                            </p>
                          </div>
                          {isDone ? (
                            <span className="hidden rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold text-gold-dark sm:inline">Completada</span>
                          ) : isNext ? (
                            <span className="hidden rounded-full bg-navy px-2.5 py-1 text-[11px] font-semibold text-white sm:inline">Siguiente</span>
                          ) : null}
                          <IconArrowRight width={18} height={18} className="shrink-0 text-muted" />
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
          {outline.length === 0 && <p className="text-muted">Este curso todavía no tiene lecciones publicadas.</p>}
        </div>
      </div>
    </div>
  );
}
