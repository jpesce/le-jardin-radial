import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';

describe('Popover', () => {
  it('renders children when open', () => {
    render(
      <Popover open>
        <PopoverTrigger>
          <button>Trigger</button>
        </PopoverTrigger>
        <PopoverContent>
          <span>Popover content</span>
        </PopoverContent>
      </Popover>,
    );
    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });

  it('does not render children when closed', () => {
    render(
      <Popover open={false}>
        <PopoverTrigger>
          <button>Trigger</button>
        </PopoverTrigger>
        <PopoverContent>
          <span>Popover content</span>
        </PopoverContent>
      </Popover>,
    );
    expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when Escape is pressed', () => {
    const onOpenChange = vi.fn();
    render(
      <Popover open onOpenChange={onOpenChange}>
        <PopoverTrigger>
          <button>Trigger</button>
        </PopoverTrigger>
        <PopoverContent>
          <span>Content</span>
        </PopoverContent>
      </Popover>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('injects aria-expanded on trigger', () => {
    render(
      <Popover open>
        <PopoverTrigger asChild>
          <button>Trigger</button>
        </PopoverTrigger>
        <PopoverContent>
          <span>Content</span>
        </PopoverContent>
      </Popover>,
    );
    expect(screen.getByText('Trigger')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
