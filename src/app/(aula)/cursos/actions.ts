'use server';

import { revalidatePath } from 'next/cache';
import { requireStudent } from '@/lib/auth/session';
import { getCourseBySlug, hasActiveGrant, markLessonDone } from '@/lib/aula';

export async function marcarVista(formData: FormData) {
  const student = await requireStudent();
  const courseSlug = String(formData.get('courseSlug') ?? '');
  const lessonSlug = String(formData.get('lessonSlug') ?? '');
  const lessonId = String(formData.get('lessonId') ?? '');
  const course = await getCourseBySlug(courseSlug);
  if (!course || !lessonId) return;
  if (!(await hasActiveGrant(student.id, course.id))) return;
  await markLessonDone(student.id, lessonId);
  revalidatePath(`/cursos/${courseSlug}`);
  revalidatePath(`/cursos/${courseSlug}/${lessonSlug}`);
}
