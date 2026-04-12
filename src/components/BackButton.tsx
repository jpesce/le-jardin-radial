import { useState, useEffect, type ComponentPropsWithoutRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../utils/cn';

type BackButtonProps = ComponentPropsWithoutRef<'button'>;

export default function BackButton({
  className,
  children,
  ...rest
}: BackButtonProps) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setReady(true);
    });
    return () => {
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <button
      className={cn(
        'group/back self-start flex gap-[0.35rem] items-center p-0 text-xs text-muted lowercase tracking-[0.03em] cursor-pointer bg-transparent border-none hover:text-fg',
        className,
      )}
      type="button"
      {...rest}
    >
      <ArrowLeft
        className={cn(
          'shrink-0 group-hover/back:-translate-x-[3px]',
          ready && 'transition-transform duration-150 ease-out',
        )}
        size={11}
      />
      {children}
    </button>
  );
}
