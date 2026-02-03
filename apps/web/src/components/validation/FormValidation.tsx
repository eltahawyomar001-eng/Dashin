/**
 * Form Validation Components & Hooks
 * Provides inline validation, input masks, password strength, and formatting utilities
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/lib/performance';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

// ============================================================================
// Validation Rules
// ============================================================================

export type ValidationRule = {
  validate: (value: string) => boolean;
  message: string;
};

export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value) => value.trim().length > 0,
    message,
  }),

  email: (message = 'Please enter a valid email'): ValidationRule => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => value.length <= max,
    message: message || `Must be at most ${max} characters`,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value) => regex.test(value),
    message,
  }),

  phone: (message = 'Please enter a valid phone number'): ValidationRule => ({
    validate: (value) => /^\+?[\d\s\-()]{10,}$/.test(value),
    message,
  }),

  url: (message = 'Please enter a valid URL'): ValidationRule => ({
    validate: (value) =>
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(
        value
      ),
    message,
  }),

  numeric: (message = 'Please enter numbers only'): ValidationRule => ({
    validate: (value) => /^\d+$/.test(value),
    message,
  }),

  alphanumeric: (message = 'Please enter letters and numbers only'): ValidationRule => ({
    validate: (value) => /^[a-zA-Z0-9]+$/.test(value),
    message,
  }),

  password: (message = 'Password must contain uppercase, lowercase, number, and special character'): ValidationRule => ({
    validate: (value) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value),
    message,
  }),
};

// ============================================================================
// Form Validation Hook
// ============================================================================

interface UseFormValidationOptions {
  rules: ValidationRule[];
  debounceMs?: number;
  validateOnChange?: boolean;
}

export function useFormValidation(
  value: string,
  { rules, debounceMs = 300, validateOnChange = true }: UseFormValidationOptions
) {
  const [error, setError] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const debouncedValue = useDebounce(value, debounceMs);

  // Validate on debounced value change
  useEffect(() => {
    if (!isTouched || !validateOnChange) return;

    setIsValidating(true);

    // Run all validation rules
    for (const rule of rules) {
      if (!rule.validate(debouncedValue)) {
        setError(rule.message);
        setIsValidating(false);
        return;
      }
    }

    setError(null);
    setIsValidating(false);
  }, [debouncedValue, rules, isTouched, validateOnChange]);

  const validate = () => {
    setIsTouched(true);
    for (const rule of rules) {
      if (!rule.validate(value)) {
        setError(rule.message);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const reset = () => {
    setError(null);
    setIsTouched(false);
    setIsValidating(false);
  };

  return {
    error,
    isValid: !error && isTouched,
    isValidating,
    isTouched,
    validate,
    setTouched: setIsTouched,
    reset,
  };
}

// ============================================================================
// Input Masks
// ============================================================================

export const inputMasks = {
  phone: (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  },

  date: (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{2})(\d{4})$/);
    if (match) {
      return `${match[1]}/${match[2]}/${match[3]}`;
    }
    return value;
  },

  creditCard: (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/(\d{1,4})/g);
    if (match) {
      return match.join(' ').substring(0, 19);
    }
    return value;
  },

  currency: (value: string): string => {
    const cleaned = value.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    if (parts[0]) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return parts.length > 1 && parts[1] ? `${parts[0] || ''}.${parts[1].substring(0, 2)}` : parts[0] || '';
  },

  ssn: (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{2})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return value;
  },

  zipCode: (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 5) {
      return `${cleaned.substring(0, 5)}-${cleaned.substring(5, 9)}`;
    }
    return cleaned;
  },
};

// ============================================================================
// Input Mask Hook
// ============================================================================

export function useInputMask(mask: (value: string) => string) {
  const [value, setValue] = useState('');
  const [displayValue, setDisplayValue] = useState('');

  const handleChange = (newValue: string) => {
    setValue(newValue);
    setDisplayValue(mask(newValue));
  };

  return {
    value,
    displayValue,
    onChange: handleChange,
    reset: () => {
      setValue('');
      setDisplayValue('');
    },
  };
}

// ============================================================================
// Password Strength
// ============================================================================

export interface PasswordStrength {
  score: number; // 0-4
  label: 'weak' | 'fair' | 'good' | 'strong' | 'very strong';
  feedback: string[];
  color: string;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const feedback: string[] = [];

  if (password.length === 0) {
    return { score: 0, label: 'weak', feedback: ['Enter a password'], color: 'text-gray-400' };
  }

  // Length check
  if (password.length >= 8) score++;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score++;

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Mix uppercase and lowercase');
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('Include numbers');
  }

  if (/[@$!%*?&#]/.test(password)) {
    score++;
  } else {
    feedback.push('Include special characters');
  }

  // Common patterns (reduce score)
  if (/^123|abc|password/i.test(password)) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common patterns');
  }

  const labels: PasswordStrength['label'][] = ['weak', 'fair', 'good', 'strong', 'very strong'];
  const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500', 'text-emerald-600'];

  const index = Math.min(score, 4);

  return {
    score: index,
    label: labels[index] || 'weak',
    feedback: feedback.length > 0 ? feedback : ['Your password is secure'],
    color: colors[index] || 'text-gray-400',
  };
}

export function usePasswordStrength(password: string) {
  return useMemo(() => calculatePasswordStrength(password), [password]);
}

// ============================================================================
// Auto-formatters
// ============================================================================

export const formatters = {
  capitalize: (value: string): string => {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  },

  titleCase: (value: string): string => {
    return value
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },

  uppercase: (value: string): string => value.toUpperCase(),

  lowercase: (value: string): string => value.toLowerCase(),

  trim: (value: string): string => value.trim(),

  removeSpaces: (value: string): string => value.replace(/\s/g, ''),

  slug: (value: string): string => {
    return value
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  },

  phone: inputMasks.phone,
  date: inputMasks.date,
  currency: inputMasks.currency,
};

// ============================================================================
// Validated Input Component
// ============================================================================

interface ValidatedInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  rules?: ValidationRule[];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  hint?: string;
  formatter?: (value: string) => string;
  debounceMs?: number;
}

export function ValidatedInput({
  label,
  type = 'text',
  value,
  onChange,
  rules = [],
  required = false,
  disabled = false,
  placeholder,
  className = '',
  hint,
  formatter,
  debounceMs = 300,
}: ValidatedInputProps) {
  const validation = useFormValidation(value, {
    rules,
    debounceMs,
    validateOnChange: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    if (formatter) {
      newValue = formatter(newValue);
    }
    onChange(newValue);
  };

  const handleBlur = () => {
    validation.setTouched(true);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <RequiredIndicator />}
      </label>

      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full px-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-offset-0
            transition-all duration-200
            ${
              validation.error && validation.isTouched
                ? 'border-red-500 focus:ring-red-500'
                : validation.isValid
                ? 'border-green-500 focus:ring-green-500'
                : 'border-gray-300 focus:ring-blue-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-background'}
          `}
        />

        {/* Status Icon */}
        <AnimatePresence>
          {validation.isTouched && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {validation.isValidating ? (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : validation.error ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hint */}
      {hint && !validation.error && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="w-3 h-3" />
          {hint}
        </p>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {validation.error && validation.isTouched && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {validation.error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {validation.isValid && !validation.isValidating && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs text-green-600 flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" />
            Looks good!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Required Indicator
// ============================================================================

export function RequiredIndicator() {
  return (
    <span className="text-red-500 ml-1" aria-label="required">
      *
    </span>
  );
}

// ============================================================================
// Password Strength Meter
// ============================================================================

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export function PasswordStrengthMeter({ password, className = '' }: PasswordStrengthMeterProps) {
  const strength = usePasswordStrength(password);

  if (password.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength Bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: index <= strength.score ? 1 : 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`
              h-1 flex-1 rounded-full origin-left
              ${
                index <= strength.score
                  ? strength.score === 0
                    ? 'bg-red-500'
                    : strength.score === 1
                    ? 'bg-orange-500'
                    : strength.score === 2
                    ? 'bg-yellow-500'
                    : strength.score === 3
                    ? 'bg-green-500'
                    : 'bg-emerald-600'
                  : 'bg-gray-200'
              }
            `}
          />
        ))}
      </div>

      {/* Strength Label */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${strength.color}`}>
          Password strength: {strength.label}
        </span>
      </div>

      {/* Feedback */}
      {strength.feedback.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-1">
          {strength.feedback.map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-1"
            >
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              {item}
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================================================
// Validated Textarea
// ============================================================================

interface ValidatedTextareaProps extends Omit<ValidatedInputProps, 'type'> {
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
}

export function ValidatedTextarea({
  label,
  value,
  onChange,
  rules = [],
  required = false,
  disabled = false,
  placeholder,
  className = '',
  hint,
  rows = 4,
  maxLength,
  showCharCount = false,
  debounceMs = 300,
}: ValidatedTextareaProps) {
  const validation = useFormValidation(value, {
    rules,
    debounceMs,
    validateOnChange: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) return;
    onChange(newValue);
  };

  const handleBlur = () => {
    validation.setTouched(true);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <RequiredIndicator />}
      </label>

      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className={`
            w-full px-3 py-2 border rounded-lg resize-none
            focus:outline-none focus:ring-2 focus:ring-offset-0
            transition-all duration-200
            ${
              validation.error && validation.isTouched
                ? 'border-red-500 focus:ring-red-500'
                : validation.isValid
                ? 'border-green-500 focus:ring-green-500'
                : 'border-gray-300 focus:ring-blue-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-background'}
          `}
        />
      </div>

      {/* Character Count */}
      {showCharCount && maxLength && (
        <p className="text-xs text-muted-foreground text-right">
          {value.length} / {maxLength}
        </p>
      )}

      {/* Hint */}
      {hint && !validation.error && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="w-3 h-3" />
          {hint}
        </p>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {validation.error && validation.isTouched && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {validation.error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {validation.isValid && !validation.isValidating && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs text-green-600 flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" />
            Looks good!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
