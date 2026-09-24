/**
 * Descarga la estructura de un curso de Kajabi (módulos, lecciones, ofertas) y la guarda como JSON
 * listo para rellenar los bunnyVideoId e importar con import:course.
 * Uso: npm run export:kajabi-course -- <kajabiCourseId> <slug>
 * Sin argumentos: lista los cursos disponibles en Kajabi.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { getCourseWithStructure, listCourses, relIds, type LessonAttributes, type ModuleAttributes } from '@/lib/kajabi/client';
import { run, slugify } from './_bootstrap';

run(async () => {
  const [courseId, slug] = process.argv.slice(2);
  if (!courseId) {
    const courses = await listCourses();
    console.log('Cursos en Kajabi:');
    for (const c of courses) console.log(`  ${c.id}\t${c.attributes.title}`);
    return;
  }
  const res = await getCourseWithStructure(courseId);
  const included = res.included ?? [];
  const mods = included.filter((r) => r.type === 'modules') as Array<typeof included[number] & { attributes: ModuleAttributes }>;
  const lessons = included.filter((r) => r.type === 'lessons') as Array<typeof included[number] & { attributes: LessonAttributes }>;
  const offerIds = relIds(res.data, 'offers');
  const pos = (v: number | string | null | undefined) => Number(v ?? 0);

  const modulesOut = mods
    .sort((a, b) => pos(a.attributes.position) - pos(b.attributes.position))
    .map((m) => {
      const ids = new Set(relIds(m, 'lessons'));
      const own = lessons.filter((l) => ids.has(l.id) || relIds(l, 'module').includes(m.id));
      return {
        title: m.attributes.title,
        description: m.attributes.description ?? null,
        kajabiModuleId: m.id,
        lessons: own
          .sort((a, b) => pos(a.attributes.position) - pos(b.attributes.position))
          .map((l) => ({
            slug: slugify(l.attributes.title),
            title: l.attributes.title,
            kajabiLessonId: l.id,
            bunnyVideoId: null,
            bodyHtml: null,
            attachments: [],
            published: l.attributes.publishing_option !== 'draft',
          })),
      };
    });

  const out = {
    slug: slug ?? slugify(res.data.attributes.title),
    title: res.data.attributes.title,
    description: res.data.attributes.description ?? null,
    thumbnailUrl: res.data.attributes.thumbnail_url ?? null,
    published: false,
    kajabiCourseId: res.data.id,
    kajabiOfferIds: offerIds,
    modules: modulesOut,
  };
  mkdirSync('content', { recursive: true });
  const file = `content/${out.slug}.json`;
  writeFileSync(file, JSON.stringify(out, null, 2));
  const n = modulesOut.reduce((a, m) => a + m.lessons.length, 0);
  console.log(`Guardado ${file}: ${modulesOut.length} módulos, ${n} lecciones, ofertas: ${offerIds.join(', ') || 'ninguna'}.`);
  console.log('Siguiente paso: rellena bunnyVideoId en cada lección y ejecuta: npm run import:course -- ' + file);
});
