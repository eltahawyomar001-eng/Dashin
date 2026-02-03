/**
 * Form Validation Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  ValidatedInput,
  validationRules,
  calculatePasswordStrength,
  inputMasks,
  formatters,
} from '../FormValidation';

describe('ValidatedInput', () => {
  it('renders input with label', () => {
    render(
      <ValidatedInput
        label="Email"
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(
      <ValidatedInput
        label="Email"
        value=""
        onChange={() => {}}
        required
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('validates on blur', async () => {
    const onChange = jest.fn();
    render(
      <ValidatedInput
        label="Email"
        value=""
        onChange={onChange}
        rules={[validationRules.required(), validationRules.email()]}
      />
    );

    const input = screen.getByLabelText('Email');
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  it('shows success state for valid input', async () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <ValidatedInput
        label="Email"
        value=""
        onChange={onChange}
        rules={[validationRules.email()]}
      />
    );

    const input = screen.getByLabelText('Email');
    fireEvent.blur(input);

    // Update value
    rerender(
      <ValidatedInput
        label="Email"
        value="test@example.com"
        onChange={onChange}
        rules={[validationRules.email()]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Looks good!')).toBeInTheDocument();
    });
  });

  it('applies formatter to input', () => {
    const onChange = jest.fn();
    render(
      <ValidatedInput
        label="Name"
        value=""
        onChange={onChange}
        formatter={formatters.capitalize}
      />
    );

    const input = screen.getByLabelText('Name') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'john' } });

    expect(onChange).toHaveBeenCalledWith('John');
  });

  it('disables input when disabled prop is true', () => {
    render(
      <ValidatedInput
        label="Email"
        value=""
        onChange={() => {}}
        disabled
      />
    );

    const input = screen.getByLabelText('Email') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('shows hint text when provided', () => {
    render(
      <ValidatedInput
        label="Email"
        value=""
        onChange={() => {}}
        hint="Enter your email address"
      />
    );

    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });
});

describe('Validation Rules', () => {
  describe('required', () => {
    it('validates non-empty string', () => {
      const rule = validationRules.required();
      expect(rule.validate('test')).toBe(true);
      expect(rule.validate('')).toBe(false);
      expect(rule.validate('   ')).toBe(false);
    });
  });

  describe('email', () => {
    it('validates email format', () => {
      const rule = validationRules.email();
      expect(rule.validate('test@example.com')).toBe(true);
      expect(rule.validate('invalid-email')).toBe(false);
      expect(rule.validate('test@')).toBe(false);
      expect(rule.validate('@example.com')).toBe(false);
    });
  });

  describe('minLength', () => {
    it('validates minimum length', () => {
      const rule = validationRules.minLength(5);
      expect(rule.validate('12345')).toBe(true);
      expect(rule.validate('123456')).toBe(true);
      expect(rule.validate('1234')).toBe(false);
    });
  });

  describe('phone', () => {
    it('validates phone numbers', () => {
      const rule = validationRules.phone();
      expect(rule.validate('(555) 123-4567')).toBe(true);
      expect(rule.validate('+1 555-123-4567')).toBe(true);
      expect(rule.validate('123')).toBe(false);
    });
  });

  describe('password', () => {
    it('validates strong password', () => {
      const rule = validationRules.password();
      expect(rule.validate('Password123!')).toBe(true);
      expect(rule.validate('weak')).toBe(false);
      expect(rule.validate('NoNumber!')).toBe(false);
    });
  });
});

describe('Input Masks', () => {
  describe('phone', () => {
    it('formats phone number', () => {
      expect(inputMasks.phone('5551234567')).toBe('(555) 123-4567');
      expect(inputMasks.phone('555')).toBe('555');
    });
  });

  describe('date', () => {
    it('formats date', () => {
      expect(inputMasks.date('01152024')).toBe('01/15/2024');
      expect(inputMasks.date('0115')).toBe('0115');
    });
  });

  describe('currency', () => {
    it('formats currency', () => {
      expect(inputMasks.currency('1234.56')).toBe('1,234.56');
      expect(inputMasks.currency('1234567.89')).toBe('1,234,567.89');
    });
  });

  describe('creditCard', () => {
    it('formats credit card', () => {
      expect(inputMasks.creditCard('1234567890123456')).toBe('1234 5678 9012 3456');
    });
  });
});

describe('Formatters', () => {
  it('capitalize formats first letter', () => {
    expect(formatters.capitalize('hello')).toBe('Hello');
    expect(formatters.capitalize('HELLO')).toBe('Hello');
  });

  it('titleCase formats each word', () => {
    expect(formatters.titleCase('hello world')).toBe('Hello World');
    expect(formatters.titleCase('HELLO WORLD')).toBe('Hello World');
  });

  it('slug creates URL-friendly string', () => {
    expect(formatters.slug('Hello World!')).toBe('hello-world');
    expect(formatters.slug('Test   Multiple   Spaces')).toBe('test-multiple-spaces');
  });

  it('trim removes whitespace', () => {
    expect(formatters.trim('  hello  ')).toBe('hello');
  });

  it('removeSpaces removes all spaces', () => {
    expect(formatters.removeSpaces('hello world')).toBe('helloworld');
  });
});

describe('Password Strength', () => {
  it('calculates weak password', () => {
    const result = calculatePasswordStrength('pass');
    expect(result.score).toBe(0);
    expect(result.label).toBe('weak');
    expect(result.feedback.length).toBeGreaterThan(0);
  });

  it('calculates fair password', () => {
    const result = calculatePasswordStrength('password');
    expect(result.score).toBeLessThan(3);
    expect(result.label).toMatch(/weak|fair/);
  });

  it('calculates strong password', () => {
    const result = calculatePasswordStrength('StrongP@ss123');
    expect(result.score).toBeGreaterThanOrEqual(3);
    expect(result.label).toMatch(/good|strong|very strong/);
  });

  it('penalizes common patterns', () => {
    const weak = calculatePasswordStrength('password123');
    const strong = calculatePasswordStrength('Str0ng!Pass');
    expect(weak.score).toBeLessThan(strong.score);
  });

  it('rewards character variety', () => {
    const result = calculatePasswordStrength('Abc123!@#');
    expect(result.score).toBeGreaterThanOrEqual(3);
  });
});
