import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';

describe('PopoverContent', () => {
  it('applies base styling classes when open', () => {
    render(
      <Popover open>
        <PopoverTrigger>
          <button>Trigger</button>
        </PopoverTrigger>
        <PopoverContent>
          <span>Content</span>
        </PopoverContent>
      </Popover>,
    );
    const content = screen.getByText('Content').closest('[data-slot]');
    expect(content).toHaveAttribute('data-slot', 'popover-content');
    expect(content?.className).toContain('bg-surface');
    expect(content?.className).toContain('border-border');
    expect(content?.className).toContain('rounded-lg');
  });

  it('applies animation classes based on state', () => {
    render(
      <Popover open>
        <PopoverTrigger>
          <button>Trigger</button>
        </PopoverTrigger>
        <PopoverContent>
          <span>Content</span>
        </PopoverContent>
      </Popover>,
    );
    const content = screen.getByText('Content').closest('[data-slot]');
    expect(content?.className).toContain('animate-popover-in');
    expect(content?.className).toContain('animate-popover-out');
  });

  it('merges custom className with base classes', () => {
    render(
      <Popover open>
        <PopoverTrigger>
          <button>Trigger</button>
        </PopoverTrigger>
        <PopoverContent className="w-64 py-3">
          <span>Content</span>
        </PopoverContent>
      </Popover>,
    );
    const content = screen.getByText('Content').closest('[data-slot]');
    expect(content?.className).toContain('w-64');
    expect(content?.className).toContain('py-3');
    expect(content?.className).toContain('bg-surface');
  });

  it('does not render content when closed', () => {
    render(
      <Popover open={false}>
        <PopoverTrigger>
          <button>Trigger</button>
        </PopoverTrigger>
        <PopoverContent>
          <span>Hidden content</span>
        </PopoverContent>
      </Popover>,
    );
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
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
