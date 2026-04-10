import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../utils/cn';

const CHECKBOX_CLASS =
  'grid place-content-center w-3.5 h-3.5 appearance-none cursor-pointer bg-bg border border-subtle rounded-[4px] ' +
  "before:content-[''] before:w-2 before:h-2 before:bg-subtle before:rounded-[2px] before:scale-0 before:transition-transform before:duration-100 " +
  'checked:before:scale-100';

export default function Checkbox({
  className,
  ...props
}: ComponentPropsWithoutRef<'input'>) {
  return (
    <input
      type="checkbox"
      className={cn(CHECKBOX_CLASS, className)}
      {...props}
    />
  );
}
