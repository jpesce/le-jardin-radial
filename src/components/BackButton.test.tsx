import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BackButton from './BackButton';

describe('BackButton', () => {
  it('renders children text', () => {
    render(<BackButton>Go back</BackButton>);
    expect(screen.getByText('Go back')).toBeInTheDocument();
  });

  it('renders as a button element', () => {
    render(<BackButton>Back</BackButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has type="button"', () => {
    render(<BackButton>Back</BackButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('forwards onClick handler', () => {
    let clicked = false;
    render(
      <BackButton
        onClick={() => {
          clicked = true;
        }}
      >
        Back
      </BackButton>,
    );
    screen.getByRole('button').click();
    expect(clicked).toBe(true);
  });

  it('renders ArrowLeft icon', () => {
    const { container } = render(<BackButton>Back</BackButton>);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('does not have transition class on initial render', () => {
    const { container } = render(<BackButton>Back</BackButton>);
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('transition-transform')).toBe(false);
  });
});
