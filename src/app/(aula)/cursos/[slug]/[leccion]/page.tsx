import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireStudent } from '@/lib/auth/session';
import { flattenLessons, getCourseBySlug, getCourseOutline, getProgressSet, hasActiveGrant } from '@/lib/aula';
import { signedEmbedUrl } from '@/lib/bunny';
import { LessonSidebar, type SidebarModule } from '@/components/LessonSidebar';
import { IconArrowLeft, IconArrowRight, IconCheck, IconClock, IconDownload } from '@/components/Icons';
import { formatDuration, lessonKind } from '@/lib/format';
import { marcarVista } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function LeccionPage({ params }: { params: Promise<{ slug: string; leccion: string }> }) {
  const student = await requireStudent();
  const { slug, leccion } = await params;
  const course = await getCourseBySlug(slug);
  if (!course || !course.published) notFound();
  if (!(await hasActiveGrant(student.id, course.id))) redirect('/mis-cursos?sin-acceso=1');

  const [outline, done] = await Promise.all([getCourseOutline(course.id), getProgressSet(student.id, course.id)]);
  const all = flattenLessons(outline);
  const index = all.findIndex((l) => l.slug === leccion);
  if (index === -1) notFound();
  const lesson = all[index];
  const prev = index > 0 ? all[index - 1] : null;
  const next = index < all.length - 1 ? all[index + 1] : null;
  const isDone = done.has(lesson.id);
  const embed = lesson.bunnyVideoId ? signedEmbedUrl(lesson.bunnyVideoId) : null;
  const dur = formatDuration(lesson.durationSeconds);

  const sidebarModules: SidebarModule[] = outline.map((m) => ({
    id: m.id,
    title: m.title,
    lessons: m.lessons.map((l) => ({ id: l.id, slug: l.slug, title: l.title, kind: lessonKind(l), duration: formatDuration(l.durationSeconds), done: done.has(l.id) })),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
        <LessonSidebar courseSlug={course.slug} courseTitle={course.title} modules={sidebarModules} currentSlug={lesson.slug} done={done.size} total={all.length} />

        <article className="min-w-0">
          <nav className="flex items-center gap-1.5 text-xs text-muted" aria-label="Ruta">
            <Link href="/mis-cursos" className="hover:text-navy">Mis cursos</Link>
            <span>/</span>
            <Link href={`/cursos/${course.slug}`} className="truncate hover:text-navy">{course.title}</Link>
            <span>/</span>
            <span className="truncate text-navy">{lesson.moduleTitle}</span>
          </nav>

          {embed && (
            <div className="mt-4 overflow-hidden rounded-2xl bg-black shadow-lift" style={{ aspectRatio: '16 / 9' }}>
              <iframe
                src={embed}
                title={lesson.title}
                loading="eager"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="ag-eyebrow">
                Lección {index + 1} de {all.length}
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{lesson.title}</h1>
              {dur && (
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted">
                  <IconClock width={14} height={14} /> {dur}
                </p>
              )}
            </div>
            <form action={marcarVista} className="shrink-0">
              <input type="hidden" name="courseSlug" value={course.slug} />
              <input type="hidden" name="lessonSlug" value={lesson.slug} />
              <input type="hidden" name="lessonId" value={lesson.id} />
              <button type="submit" disabled={isDone} className={`ag-btn ${isDone ? 'ag-btn-ghost' : 'ag-btn-primary'}`}>
                <IconCheck width={18} height={18} strokeWidth={2.5} />
                {isDone ? 'Completada' : 'Marcar como completada'}
              </button>
            </form>
          </div>

          {lesson.bodyHtml && <div className="ag-card ag-prose mt-6 p-6 sm:p-8" dangerouslySetInnerHTML={{ __html: lesson.bodyHtml }} />}

          {lesson.attachments.length > 0 && (
            <section className="mt-6">
              <p className="ag-eyebrow">Material de la lección</p>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {lesson.attachments.map((a) => (
                  <li key={a.url}>
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="ag-card ag-card-hover flex items-center gap-3 p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-soft text-gold-dark">
                        <IconDownload width={18} height={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{a.title}</span>
                        <span className="block text-xs text-muted">Abrir o descargar</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!embed && !lesson.bodyHtml && lesson.attachments.length === 0 && (
            <div className="ag-card mt-6 p-8 text-center text-muted">Esta lección todavía no tiene contenido.</div>
          )}

          <nav className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="Lección anterior y siguiente">
            {prev ? (
              <Link href={`/cursos/${course.slug}/${prev.slug}`} className="ag-card ag-card-hover flex items-center gap-3 p-4">
                <IconArrowLeft width={18} height={18} className="shrink-0 text-muted" />
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-wider text-muted">Anterior</span>
                  <span className="block truncate text-sm font-medium">{prev.title}</span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/cursos/${course.slug}/${next.slug}`} className="ag-card ag-card-hover flex items-center justify-end gap-3 p-4 text-right">
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-wider text-muted">Siguiente</span>
                  <span className="block truncate text-sm font-medium">{next.title}</span>
                </span>
                <IconArrowRight width={18} height={18} className="shrink-0 text-muted" />
              </Link>
            ) : (
              <Link href={`/cursos/${course.slug}`} className="ag-card ag-card-hover flex items-center justify-end gap-3 p-4 text-right">
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-wider text-muted">Has llegado al final</span>
                  <span className="block truncate text-sm font-medium">Volver al programa del curso</span>
                </span>
                <IconArrowRight width={18} height={18} className="shrink-0 text-muted" />
              </Link>
            )}
          </nav>
        </article>
      </div>
    </div>
  );
}
