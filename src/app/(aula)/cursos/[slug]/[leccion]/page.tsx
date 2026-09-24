import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireStudent } from '@/lib/auth/session';
import { flattenLessons, getCourseBySlug, getCourseOutline, getProgressSet, hasActiveGrant } from '@/lib/aula';
import { signedEmbedUrl } from '@/lib/bunny';
import { marcarVista } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function LeccionPage({ params }: { params: Promise<{ slug: string; leccion: string }> }) {
  const student = await requireStudent();
  const { slug, leccion } = await params;
  const course = await getCourseBySlug(slug);
  if (!course || !course.published) notFound();
  if (!(await hasActiveGrant(student.id, course.id))) redirect('/mis-cursos?sin-acceso=1');

  const outline = await getCourseOutline(course.id);
  const all = flattenLessons(outline);
  const index = all.findIndex((l) => l.slug === leccion);
  if (index === -1) notFound();
  const lesson = all[index];
  const prev = index > 0 ? all[index - 1] : null;
  const next = index < all.length - 1 ? all[index + 1] : null;
  const done = await getProgressSet(student.id, course.id);
  const embed = lesson.bunnyVideoId ? signedEmbedUrl(lesson.bunnyVideoId) : null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/cursos/${course.slug}`} className="text-sm text-navy/60 hover:underline">← {course.title}</Link>
      <p className="mt-3 text-xs uppercase tracking-wider text-navy/50">{lesson.moduleTitle}</p>
      <h1 className="mt-1 text-2xl font-semibold">{lesson.title}</h1>

      {embed && (
        <div className="mt-5 overflow-hidden rounded-xl bg-black" style={{ aspectRatio: '16 / 9' }}>
          <iframe
            src={embed}
            title={lesson.title}
            loading="lazy"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      )}

      {lesson.bodyHtml && <div className="ag-prose mt-6 rounded-xl border border-navy/10 bg-white p-6" dangerouslySetInnerHTML={{ __html: lesson.bodyHtml }} />}

      {lesson.attachments.length > 0 && (
        <section className="mt-6 rounded-xl border border-navy/10 bg-white p-6">
          <h2 className="font-semibold">Material de la lección</h2>
          <ul className="mt-3 space-y-2">
            {lesson.attachments.map((a) => (
              <li key={a.url}>
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-gold-dark underline">{a.title}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          {prev ? (
            <Link href={`/cursos/${course.slug}/${prev.slug}`} className="text-sm text-navy/70 hover:underline">← {prev.title}</Link>
          ) : (
            <span />
          )}
        </div>
        <form action={marcarVista}>
          <input type="hidden" name="courseSlug" value={course.slug} />
          <input type="hidden" name="lessonSlug" value={lesson.slug} />
          <input type="hidden" name="lessonId" value={lesson.id} />
          <button
            type="submit"
            disabled={done.has(lesson.id)}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy hover:bg-gold-dark disabled:cursor-default disabled:opacity-60"
          >
            {done.has(lesson.id) ? 'Lección vista ✓' : 'Marcar como vista'}
          </button>
        </form>
        <div>
          {next ? (
            <Link href={`/cursos/${course.slug}/${next.slug}`} className="text-sm font-medium text-navy hover:underline">{next.title} →</Link>
          ) : (
            <span className="text-sm text-navy/50">Última lección</span>
          )}
        </div>
      </div>
    </div>
  );
}
