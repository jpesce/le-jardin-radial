interface ButtonClassParams {
  variant?: string;
  round?: boolean;
  size?: string;
  color?: string;
  iconOnly?: boolean;
}

const BASE =
  'flex items-center justify-center overflow-hidden font-[inherit] lowercase tracking-[0.03em] cursor-pointer transition-all duration-200 ease-out';

const VARIANT: Record<string, string> = {
  outline:
    'text-subtle bg-transparent border border-solid border-border-input hover:text-fg hover:border-muted',
  solid: 'text-surface bg-fg border-none hover:opacity-85',
  ghost:
    'text-subtle bg-transparent border-none hover:text-fg hover:bg-divider',
};

const SIZE_BTN: Record<string, string> = {
  xs: '',
  sm: 'text-2xs',
  md: 'text-xs',
  lg: 'text-sm',
};

const SIZE_INNER: Record<string, string> = {
  xs: 'p-1',
  sm: 'px-[0.6rem] py-[0.4rem]',
  md: 'px-[0.7rem] py-[0.5rem]',
  lg: 'px-[1.1rem] py-[0.55rem]',
};

const SIZE_INNER_ICON: Record<string, string> = {
  xs: 'p-1',
  sm: 'p-[0.4rem]',
  md: 'p-[0.5rem]',
  lg: 'p-[0.55rem]',
};

export function buttonClass({
  variant = 'outline',
  round,
  size = 'md',
  color,
  iconOnly,
}: ButtonClassParams): string {
  const cls = [BASE, VARIANT[variant] ?? ''];
  cls.push(SIZE_BTN[size] ?? '');
  cls.push('leading-none');
  cls.push(round ? 'rounded-full' : 'rounded-md');
  if (color === 'danger' && variant === 'solid') cls.push('bg-danger');
  if (color === 'danger' && variant === 'ghost')
    cls.push('hover:text-warning hover:bg-transparent');
  if (iconOnly) cls.push('aspect-square');
  return cls.join(' ');
}

export function innerClass(size = 'md', iconOnly = false): string {
  const base =
    'flex gap-[0.35rem] items-center justify-center w-max whitespace-nowrap';
  const padding = iconOnly
    ? (SIZE_INNER_ICON[size] ?? '')
    : (SIZE_INNER[size] ?? '');
  return `${base} ${padding}`;
}
