import { useEffect, type ReactNode } from 'react';
import SadFlower from './SadFlower';

interface FallbackPageProps {
  title: string;
  description: string;
  actions: ReactNode;
}

export default function FallbackPage({
  title,
  description,
  actions,
}: FallbackPageProps) {
  useEffect(() => {
    document.title = `${title} — Le Jardin Radial`;
  }, [title]);

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-6 p-8 text-fg">
      <SadFlower className="w-32 h-40" />
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-sm font-bold lowercase tracking-[0.03em]">
          {title}
        </h1>
        <p className="max-w-64 text-xs text-muted lowercase tracking-[0.03em]">
          {description}
        </p>
      </div>
      <div className="flex gap-3">{actions}</div>
    </div>
  );
}
