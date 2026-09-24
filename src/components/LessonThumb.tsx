import { IconDoc, IconDownload, IconPlay } from './Icons';
import type { LessonKind } from '@/lib/format';

/** Miniatura de una lección en el índice del curso: imagen del vídeo si existe, si no un icono según el tipo. */
export function LessonThumb({ kind, imageUrl, done }: { kind: LessonKind; imageUrl: string | null; done: boolean }) {
  return (
    <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-navy">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-full w-full object-cover opacity-90" loading="lazy" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy to-navy-mid text-gold">
          {kind === 'video' ? <IconPlay width={18} height={18} /> : kind === 'texto' ? <IconDoc width={18} height={18} /> : <IconDownload width={18} height={18} />}
        </div>
      )}
      {kind === 'video' && imageUrl && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-navy">
            <IconPlay width={12} height={12} />
          </span>
        </span>
      )}
      {done && <span className="absolute right-1 top-1 rounded-full bg-gold px-1.5 text-[10px] font-bold text-navy">✓</span>}
    </div>
  );
}
