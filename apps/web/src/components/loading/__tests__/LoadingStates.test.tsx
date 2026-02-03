/**
 * Loading Component Tests
 */

import { render, screen } from '@testing-library/react';
import { AnimatedSpinner } from '@/components/animations';
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
} from '@/components/skeletons';
import {
  LoadingWrapper,
} from '../LoadingWrapper';

describe('AnimatedSpinner', () => {
  it('renders spinner component', () => {
    const { container } = render(<AnimatedSpinner />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders spinner with custom size', () => {
    const { container } = render(<AnimatedSpinner size={64} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('64px');
    expect(wrapper.style.height).toBe('64px');
  });

  it('applies custom className', () => {
    const { container } = render(<AnimatedSpinner className="custom-spinner" />);
    expect(container.firstChild).toHaveClass('custom-spinner');
  });
});

describe('Skeleton', () => {
  it('renders skeleton component', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass('bg-muted');
  });

  it('renders skeleton without animation', () => {
    const { container } = render(<Skeleton animate={false} />);
    expect(container.firstChild).toHaveClass('bg-muted');
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="my-skeleton" />);
    expect(container.firstChild).toHaveClass('my-skeleton');
  });

  it('applies custom styles', () => {
    const { container} = render(<Skeleton style={{ width: '200px', height: '100px' }} />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.style.width).toBe('200px');
    expect(skeleton.style.height).toBe('100px');
  });
});

describe('SkeletonText', () => {
  it('renders text skeleton', () => {
    const { container } = render(<SkeletonText />);
    expect(container.firstChild).toHaveClass('bg-muted');
    expect(container.firstChild).toHaveClass('h-4');
  });

  it('applies custom width', () => {
    const { container } = render(<SkeletonText width="50%" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.style.width).toBe('50%');
  });
});

describe('SkeletonCard', () => {
  it('renders card skeleton structure', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toHaveClass('rounded-lg');
    expect(container.querySelector('.space-y-2')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SkeletonCard className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });
});

describe('SkeletonTable', () => {
  it('renders table skeleton with header and rows', () => {
    const { container } = render(<SkeletonTable />);
    expect(container.firstChild).toHaveClass('rounded-lg');
    expect(container.querySelector('.bg-muted\\/50')).toBeInTheDocument();
  });

  it('renders with custom number of rows', () => {
    const { container } = render(<SkeletonTable rows={3} />);
    const rows = container.querySelectorAll('.flex.items-center.gap-4');
    expect(rows.length).toBeGreaterThanOrEqual(3);
  });

  it('renders with custom number of columns', () => {
    const { container } = render(<SkeletonTable columns={4} rows={2} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('LoadingWrapper', () => {
  it('hides content when isLoading is true', () => {
    const { container } = render(
      <LoadingWrapper isLoading={true}>
        <div>Content</div>
      </LoadingWrapper>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.opacity).toBe('0');
  });

  it('shows content when isLoading is false', () => {
    render(
      <LoadingWrapper isLoading={false}>
        <div>Content</div>
      </LoadingWrapper>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('shows custom skeleton when provided', () => {
    render(
      <LoadingWrapper
        isLoading={true}
        skeleton={<div data-testid="custom-skeleton">Loading...</div>}
      >
        <div>Content</div>
      </LoadingWrapper>
    );

    expect(screen.getByTestId('custom-skeleton')).toBeInTheDocument();
  });

  it('shows spinner type loading', () => {
    const { container } = render(
      <LoadingWrapper isLoading={true} type="spinner">
        <div>Content</div>
      </LoadingWrapper>
    );

    const spinner = container.querySelector('svg');
    expect(spinner).toBeInTheDocument();
  });

  it('shows loading text when provided', () => {
    render(
      <LoadingWrapper isLoading={true} type="spinner" text="Loading data...">
        <div>Content</div>
      </LoadingWrapper>
    );

    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('uses default skeleton when isLoading and no type specified', () => {
    const { container } = render(
      <LoadingWrapper isLoading={true}>
        <div>Content</div>
      </LoadingWrapper>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
  });
});
