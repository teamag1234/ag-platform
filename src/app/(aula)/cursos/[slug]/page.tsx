import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireStudent } from '@/lib/auth/session';
import { getCourseBySlug, getCourseOutline, getProgressSet, hasActiveGrant } from '@/lib/aula';

export const dynamic = 'force-dynamic';

export default async function CursoPage({ params }: { params: Promise<{ slug: string }> }) {
  const student = await requireStudent();
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course || !course.published) notFound();
  if (!(await hasActiveGrant(student.id, course.id))) redirect('/mis-cursos?sin-acceso=1');

  const [outline, done] = await Promise.all([getCourseOutline(course.id), getProgressSet(student.id, course.id)]);
  const total = outline.reduce((n, m) => n + m.lessons.length, 0);

  return (
    <div>
      <Link href="/mis-cursos" className="text-sm text-navy/60 hover:underline">← Mis cursos</Link>
      <h1 className="mt-2 text-2xl font-semibold">{course.title}</h1>
      {course.description && <p className="mt-2 max-w-2xl text-navy/70">{course.description}</p>}
      <p className="mt-2 text-sm text-navy/60">{done.size} de {total} lecciones vistas</p>

      <div className="mt-8 space-y-6">
        {outline.map((m, i) => (
          <section key={m.id} className="rounded-xl border border-navy/10 bg-white">
            <header className="border-b border-navy/10 px-5 py-4">
              <h2 className="font-semibold">
                <span className="mr-2 text-gold-dark">{i + 1}.</span>
                {m.title}
              </h2>
              {m.description && <p className="mt-1 text-sm text-navy/60">{m.description}</p>}
            </header>
            <ol>
              {m.lessons.map((l) => (
                <li key={l.id} className="border-b border-navy/5 last:border-0">
                  <Link href={`/cursos/${course.slug}/${l.slug}`} className="flex items-center gap-3 px-5 py-3 hover:bg-paper">
                    <span
                      aria-hidden
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                        done.has(l.id) ? 'border-gold bg-gold text-navy' : 'border-navy/30 text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    <span className="flex-1">{l.title}</span>
                    {l.bunnyVideoId && <span className="text-xs text-navy/50">vídeo</span>}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
        {outline.length === 0 && <p className="text-navy/60">Este curso todavía no tiene lecciones publicadas.</p>}
      </div>
    </div>
  );
}
