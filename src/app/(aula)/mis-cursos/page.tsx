import Link from 'next/link';
import { requireStudent } from '@/lib/auth/session';
import { getLastActivity, getStudentCourses } from '@/lib/aula';
import { CourseCover } from '@/components/CourseCover';
import { ProgressBar, ProgressRing } from '@/components/ProgressBar';
import { IconArrowRight, IconPlay } from '@/components/Icons';
import { firstName } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function MisCursosPage({ searchParams }: { searchParams: Promise<{ 'sin-acceso'?: string }> }) {
  const student = await requireStudent();
  const params = await searchParams;
  const [items, last] = await Promise.all([getStudentCourses(student.id), getLastActivity(student.id)]);
  const nombre = firstName(student.name);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="ag-eyebrow">Mi biblioteca</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{nombre ? `Hola, ${nombre}` : 'Mis cursos'}</h1>
          <p className="mt-1 text-muted">
            {items.length === 0 ? 'Todavía no tienes cursos activos.' : items.length === 1 ? 'Tienes 1 curso activo.' : `Tienes ${items.length} cursos activos.`}
          </p>
        </div>
      </div>

      {params['sin-acceso'] && (
        <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">No tienes acceso a ese curso con este email.</p>
      )}

      {last && last.next && (
        <section className="ag-card ag-hero mt-8 overflow-hidden text-white">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="h-28 w-full shrink-0 overflow-hidden rounded-2xl sm:h-32 sm:w-52">
              <CourseCover title={last.course.title} imageUrl={last.course.thumbnailUrl} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="ag-eyebrow ag-eyebrow-light">Continuar donde lo dejaste</p>
              <h2 className="mt-1 truncate text-xl font-semibold">{last.course.title}</h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-white/75">
                <IconPlay width={14} height={14} className="text-gold" />
                <span className="truncate">Siguiente: {last.next.title}</span>
              </p>
              <div className="mt-4 flex items-center gap-3">
                <ProgressBar value={last.total ? (last.done / last.total) * 100 : 0} className="max-w-xs" light />
                <span className="text-xs text-white/70">
                  {last.done} de {last.total}
                </span>
              </div>
            </div>
            <Link href={`/cursos/${last.course.slug}/${last.next.slug}`} className="ag-btn ag-btn-primary shrink-0">
              Continuar <IconArrowRight width={18} height={18} />
            </Link>
          </div>
        </section>
      )}

      {items.length === 0 ? (
        <div className="ag-card mt-8 p-8 text-center">
          <p className="text-lg font-semibold">No hay cursos asociados a {student.email}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Si compraste con otro email, sal y entra con ese. Si crees que es un error, escríbenos por WhatsApp y lo revisamos.
          </p>
        </div>
      ) : (
        <>
          <h2 className="mt-10 text-lg font-semibold">Tus cursos</h2>
          <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(({ course, total, done }) => {
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <li key={course.id} className="ag-card ag-card-hover overflow-hidden">
                  <Link href={`/cursos/${course.slug}`} className="block">
                    <div className="h-40">
                      <CourseCover title={course.title} imageUrl={course.thumbnailUrl} />
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-base font-semibold leading-snug">{course.title}</h3>
                          <p className="mt-1 text-xs text-muted">
                            {total} {total === 1 ? 'lección' : 'lecciones'}
                            {pct === 100 && ' · Completado'}
                          </p>
                        </div>
                        <ProgressRing value={pct} size={52} stroke={5} />
                      </div>
                      <span className={`ag-btn ag-btn-sm mt-4 w-full ${done > 0 ? 'ag-btn-dark' : 'ag-btn-primary'}`}>
                        {pct === 100 ? 'Repasar' : done > 0 ? 'Continuar' : 'Empezar'}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
