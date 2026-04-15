import * as React from 'react';

import { cn } from '../../utils/cn';

/** Text input with earth-palette styling. Forwards ref and all native input attributes. */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        data-slot="input"
        className={cn(
          'm-0 px-[0.6rem] py-[0.4rem] text-xs text-fg outline-none bg-surface-input border border-border rounded-md transition-[border-color] duration-150 focus:bg-surface focus:border-border-hover',
          className,
        )}
        {...props}
      />
    );
  },
);

export { Input };
