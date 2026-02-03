/**
 * Animation Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import {
  FadeIn,
  SlideFromRight,
  SlideFromLeft,
  SlideFromTop,
  SlideFromBottom,
  ScaleIn,
  StaggeredList,
  StaggeredItem,
  Pulse,
  PageTransition,
  AnimatedCard,
  AnimatedButton,
  Collapse,
  AnimatedCheckmark,
} from '../index';

describe('FadeIn', () => {
  it('renders children', () => {
    render(
      <FadeIn>
        <div>Fade content</div>
      </FadeIn>
    );

    expect(screen.getByText('Fade content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <FadeIn className="custom-fade">
        <div>Content</div>
      </FadeIn>
    );

    expect(container.firstChild).toHaveClass('custom-fade');
  });
});

describe('SlideFromRight', () => {
  it('renders children', () => {
    render(
      <SlideFromRight>
        <div>Slide content</div>
      </SlideFromRight>
    );

    expect(screen.getByText('Slide content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SlideFromRight className="custom-slide">
        <div>Content</div>
      </SlideFromRight>
    );

    expect(container.firstChild).toHaveClass('custom-slide');
  });
});

describe('SlideFromLeft', () => {
  it('renders children', () => {
    render(
      <SlideFromLeft>
        <div>Slide from left</div>
      </SlideFromLeft>
    );

    expect(screen.getByText('Slide from left')).toBeInTheDocument();
  });
});

describe('SlideFromTop', () => {
  it('renders children', () => {
    render(
      <SlideFromTop>
        <div>Slide from top</div>
      </SlideFromTop>
    );

    expect(screen.getByText('Slide from top')).toBeInTheDocument();
  });
});

describe('SlideFromBottom', () => {
  it('renders children', () => {
    render(
      <SlideFromBottom>
        <div>Slide from bottom</div>
      </SlideFromBottom>
    );

    expect(screen.getByText('Slide from bottom')).toBeInTheDocument();
  });
});

describe('ScaleIn', () => {
  it('renders children', () => {
    render(
      <ScaleIn>
        <div>Scale content</div>
      </ScaleIn>
    );

    expect(screen.getByText('Scale content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ScaleIn className="custom-scale">
        <div>Scaled</div>
      </ScaleIn>
    );

    expect(container.firstChild).toHaveClass('custom-scale');
  });
});

describe('StaggeredList', () => {
  it('renders all children', () => {
    render(
      <StaggeredList>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </StaggeredList>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StaggeredList className="custom-list">
        <div>Item 1</div>
      </StaggeredList>
    );

    expect(container.firstChild).toHaveClass('custom-list');
  });

  it('handles single child', () => {
    render(
      <StaggeredList>
        <div>Single child</div>
      </StaggeredList>
    );

    expect(screen.getByText('Single child')).toBeInTheDocument();
  });
});

describe('StaggeredItem', () => {
  it('renders child content', () => {
    render(
      <StaggeredItem>
        <div>Staggered item</div>
      </StaggeredItem>
    );

    expect(screen.getByText('Staggered item')).toBeInTheDocument();
  });
});

describe('Pulse', () => {
  it('renders children with pulse animation', () => {
    render(
      <Pulse>
        <div>Pulsing content</div>
      </Pulse>
    );

    expect(screen.getByText('Pulsing content')).toBeInTheDocument();
  });

  it('applies pulse animation', () => {
    const { container } = render(
      <Pulse>
        <div>Pulse</div>
      </Pulse>
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Pulse className="custom-pulse">
        <div>Custom</div>
      </Pulse>
    );

    expect(container.firstChild).toHaveClass('custom-pulse');
  });
});

describe('PageTransition', () => {
  it('renders children', () => {
    render(
      <PageTransition>
        <div>Page content</div>
      </PageTransition>
    );

    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('applies transition wrapper', () => {
    const { container } = render(
      <PageTransition>
        <div>Transitioning page</div>
      </PageTransition>
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles page changes', async () => {
    const { rerender } = render(
      <PageTransition>
        <div>Page 1</div>
      </PageTransition>
    );

    expect(screen.getByText('Page 1')).toBeInTheDocument();

    rerender(
      <PageTransition>
        <div>Page 2</div>
      </PageTransition>
    );

    await waitFor(() => {
      expect(screen.getByText('Page 2')).toBeInTheDocument();
    });
  });
});

describe('AnimatedCard', () => {
  it('renders card content', () => {
    render(
      <AnimatedCard>
        <div>Card content</div>
      </AnimatedCard>
    );

    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <AnimatedCard className="custom-card">
        <div>Card</div>
      </AnimatedCard>
    );

    expect(container.firstChild).toHaveClass('custom-card');
  });
});

describe('AnimatedButton', () => {
  it('renders button content', () => {
    render(
      <AnimatedButton>
        <span>Click me</span>
      </AnimatedButton>
    );

    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <AnimatedButton className="custom-button">
        <span>Button</span>
      </AnimatedButton>
    );

    expect(container.firstChild).toHaveClass('custom-button');
  });
});

describe('Collapse', () => {
  it('shows content when isOpen is true', () => {
    render(
      <Collapse isOpen={true}>
        <div>Collapsed content</div>
      </Collapse>
    );

    expect(screen.getByText('Collapsed content')).toBeInTheDocument();
  });

  it('hides content when isOpen is false', () => {
    render(
      <Collapse isOpen={false}>
        <div>Hidden content</div>
      </Collapse>
    );

    expect(screen.queryByText('Hidden content')).not.toBeVisible();
  });

  it('toggles visibility', () => {
    const { rerender } = render(
      <Collapse isOpen={false}>
        <div>Toggle content</div>
      </Collapse>
    );

    expect(screen.queryByText('Toggle content')).not.toBeVisible();

    rerender(
      <Collapse isOpen={true}>
        <div>Toggle content</div>
      </Collapse>
    );

    expect(screen.getByText('Toggle content')).toBeInTheDocument();
  });
});

describe('AnimatedCheckmark', () => {
  it('renders checkmark icon', () => {
    const { container } = render(<AnimatedCheckmark />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    const { container } = render(<AnimatedCheckmark size={48} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<AnimatedCheckmark className="custom-check" />);
    expect(container.firstChild).toHaveClass('custom-check');
  });
});
