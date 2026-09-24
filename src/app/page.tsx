import { redirect } from 'next/navigation';
import { getCurrentStudent } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const student = await getCurrentStudent();
  redirect(student ? '/mis-cursos' : '/acceso');
}
