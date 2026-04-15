import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { buttonClass, innerClass } from './ui/buttonStyles';
import Button from './ui/button';

describe('buttonClass', () => {
  it('applies outline variant by default', () => {
    const cls = buttonClass({});
    expect(cls).toContain('border-border-input');
  });

  it('applies solid variant', () => {
    const cls = buttonClass({ variant: 'solid' });
    expect(cls).toContain('bg-fg');
    expect(cls).toContain('border-none');
  });

  it('applies ghost variant', () => {
    const cls = buttonClass({ variant: 'ghost' });
    expect(cls).toContain('bg-transparent');
    expect(cls).toContain('border-none');
  });

  it('applies rounded-full when round', () => {
    const cls = buttonClass({ round: true });
    expect(cls).toContain('rounded-full');
    expect(cls).not.toContain('rounded-md');
  });

  it('applies rounded-md when not round', () => {
    const cls = buttonClass({ round: false });
    expect(cls).toContain('rounded-md');
    expect(cls).not.toContain('rounded-full');
  });

  it('applies danger color to solid variant', () => {
    const cls = buttonClass({ variant: 'solid', color: 'danger' });
    expect(cls).toContain('bg-danger');
  });

  it('applies danger color to ghost variant', () => {
    const cls = buttonClass({ variant: 'ghost', color: 'danger' });
    expect(cls).toContain('hover:text-warning');
  });

  it('applies aspect-square when iconOnly', () => {
    const cls = buttonClass({ iconOnly: true });
    expect(cls).toContain('aspect-square');
  });

  it('applies size classes', () => {
    expect(buttonClass({ size: 'sm' })).toContain('text-2xs');
    expect(buttonClass({ size: 'md' })).toContain('text-xs');
    expect(buttonClass({ size: 'lg' })).toContain('text-sm');
  });
});

describe('innerClass', () => {
  it('applies padding for md size', () => {
    const cls = innerClass('md', false);
    expect(cls).toContain('px-[0.7rem]');
  });

  it('applies square padding when iconOnly', () => {
    const cls = innerClass('md', true);
    expect(cls).toContain('p-[0.5rem]');
    expect(cls).not.toContain('px-[0.7rem]');
  });
});

describe('Button rendering', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders as a button element', () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders icon alongside children', () => {
    render(<Button icon={<span data-testid="icon">★</span>}>Label</Button>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('forwards onClick handler', () => {
    let clicked = false;
    render(
      <Button
        onClick={() => {
          clicked = true;
        }}
      >
        Test
      </Button>,
    );
    screen.getByRole('button').click();
    expect(clicked).toBe(true);
  });
});
