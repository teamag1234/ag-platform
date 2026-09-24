import Link from 'next/link';
import { requireStudent } from '@/lib/auth/session';
import { getStudentCourses } from '@/lib/aula';

export const dynamic = 'force-dynamic';

export default async function MisCursosPage({ searchParams }: { searchParams: Promise<{ 'sin-acceso'?: string }> }) {
  const student = await requireStudent();
  const params = await searchParams;
  const items = await getStudentCourses(student.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Mis cursos</h1>
      {params['sin-acceso'] && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">No tienes acceso a ese curso con este email.</p>
      )}
      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-navy/10 bg-white p-6">
          <p className="font-medium">Todavía no hay cursos asociados a {student.email}.</p>
          <p className="mt-2 text-sm text-navy/70">
            Si compraste con otro email, sal y entra con ese. Si crees que es un error, escríbenos por WhatsApp.
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {items.map(({ course, total, done }) => {
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <li key={course.id} className="overflow-hidden rounded-xl border border-navy/10 bg-white">
                {course.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.thumbnailUrl} alt="" className="h-36 w-full object-cover" />
                )}
                <div className="p-5">
                  <h2 className="text-lg font-semibold">{course.title}</h2>
                  {course.description && <p className="mt-1 line-clamp-2 text-sm text-navy/70">{course.description}</p>}
                  <div className="mt-4 h-2 w-full rounded-full bg-navy/10">
                    <div className="h-2 rounded-full bg-gold" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-navy/60">
                    {done} de {total} lecciones · {pct}%
                  </p>
                  <Link href={`/cursos/${course.slug}`} className="mt-4 inline-block rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-soft">
                    {done > 0 ? 'Continuar' : 'Empezar'}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
