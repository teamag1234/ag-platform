import Image from 'next/image';

type Props = { variant?: 'white' | 'navy'; width?: number; className?: string; priority?: boolean };

/** Logo de AG Academy. "white" para fondos navy, "navy" para fondos claros. Proporción original 812x287. */
export function Logo({ variant = 'white', width = 160, className, priority }: Props) {
  const height = Math.round((width * 287) / 812);
  return (
    <Image
      src={variant === 'white' ? '/logo-ag.png' : '/logo-ag-navy.png'}
      alt="AG Academy"
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
