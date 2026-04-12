import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Popover from './Popover';

describe('Popover', () => {
  it('renders children when open', () => {
    render(
      <Popover isOpen onClose={() => {}}>
        <span>Popover content</span>
      </Popover>,
    );
    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });

  it('does not render children when closed', () => {
    render(
      <Popover isOpen={false} onClose={() => {}}>
        <span>Popover content</span>
      </Popover>,
    );
    expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
  });

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn();
    render(
      <Popover isOpen onClose={onClose}>
        <span>Content</span>
      </Popover>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose on Escape when closed', () => {
    const onClose = vi.fn();
    render(
      <Popover isOpen={false} onClose={onClose}>
        <span>Content</span>
      </Popover>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders with role="dialog"', () => {
    render(
      <Popover isOpen onClose={() => {}}>
        <span>Content</span>
      </Popover>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('applies aria-label', () => {
    render(
      <Popover isOpen onClose={() => {}} ariaLabel="Test dialog">
        <span>Content</span>
      </Popover>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Test dialog',
    );
  });

  it('injects aria-expanded on trigger', () => {
    render(
      <Popover isOpen onClose={() => {}} trigger={<button>Trigger</button>}>
        <span>Content</span>
      </Popover>,
    );
    expect(screen.getByText('Trigger')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('injects aria-haspopup on trigger', () => {
    render(
      <Popover
        isOpen={false}
        onClose={() => {}}
        trigger={<button>Trigger</button>}
      >
        <span>Content</span>
      </Popover>,
    );
    expect(screen.getByText('Trigger')).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
  });

  it('wraps trigger and content in relative div', () => {
    const { container } = render(
      <Popover isOpen onClose={() => {}} trigger={<button>Trigger</button>}>
        <span>Content</span>
      </Popover>,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.classList.contains('relative')).toBe(true);
  });
});
