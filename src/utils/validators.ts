// Vuetify Validation Rules with i18n support
// Usage: const { required, minLength, ... } = useValidators()

import { useI18n } from 'vue-i18n';

type ValidationRule = (value: any) => boolean | string;

/**
 * Create validators with i18n support (auto-imports useI18n)
 * Usage in component: const { required, minLength, ... } = useValidators()
 */
export function useValidators() {
  const { t } = useI18n();
  // Helper to get translated message or fallback
  const msg = (key: string, params?: Record<string, any>, fallback?: string): string => {
    if (t) {
      return t(`validation.${key}`, params || {});
    }
    return fallback || key;
  };

  // ==================== Basic Rules ====================

  /**
   * Required field
   * @param messageKey - Translation key (e.g., 'arabicNameRequired') or custom message
   */
  const required = (messageKey?: string): ValidationRule => {
    return (value: any) => {
      if (value === null || value === undefined || value === '') {
        return messageKey ? msg(messageKey) : msg('required');
      }
      if (Array.isArray(value) && value.length === 0) {
        return messageKey ? msg(messageKey) : msg('required');
      }
      return true;
    };
  };

  /**
   * Minimum character length
   */
  const minLength = (min: number, message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      return String(value).length >= min || message || msg('minLength', { min });
    };
  };

  /**
   * Maximum character length
   */
  const maxLength = (max: number, message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      return String(value).length <= max || message || msg('maxLength', { max });
    };
  };

  /**
   * Exact length
   */
  const exactLength = (length: number, message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      return String(value).length === length || message || msg('exactLength', { length });
    };
  };

  // ==================== Number Rules ====================

  /**
   * Numeric only
   */
  const numeric = (message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      return !isNaN(Number(value)) || message || msg('numeric');
    };
  };

  /**
   * Integer only
   */
  const integer = (message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      return Number.isInteger(Number(value)) || message || msg('integer');
    };
  };

  /**
   * Minimum value
   */
  const minValue = (min: number, message?: string): ValidationRule => {
    return (value: any) => {
      if (!value && value !== 0) return true;
      return Number(value) >= min || message || msg('minValue', { min });
    };
  };

  /**
   * Maximum value
   */
  const maxValue = (max: number, message?: string): ValidationRule => {
    return (value: any) => {
      if (!value && value !== 0) return true;
      return Number(value) <= max || message || msg('maxValue', { max });
    };
  };

  /**
   * Value between two limits
   */
  const between = (min: number, max: number, message?: string): ValidationRule => {
    return (value: any) => {
      if (!value && value !== 0) return true;
      const num = Number(value);
      return (num >= min && num <= max) || message || msg('between', { min, max });
    };
  };

  /**
   * Positive number
   */
  const positive = (message?: string): ValidationRule => {
    return (value: any) => {
      if (!value && value !== 0) return true;
      return Number(value) > 0 || message || msg('positive');
    };
  };

  // ==================== Text Rules ====================

  /**
   * Email validation
   */
  const email = (message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return pattern.test(value) || message || msg('email');
    };
  };

  /**
   * Phone number (supports Arabic and English digits)
   */
  const phone = (message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      const pattern = /^[+]?[\d٠-٩]{8,15}$/;
      return pattern.test(value.replace(/\s/g, '')) || message || msg('phone');
    };
  };

  /**
   * Saudi phone number
   */
  const saudiPhone = (message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      const cleaned = value.replace(/\s/g, '');
      const pattern = /^(05|5|\+9665|009665)[0-9]{8}$/;
      return pattern.test(cleaned) || message || msg('saudiPhone');
    };
  };

  /**
   * Arabic text only
   */
  const arabicOnly = (message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      const pattern = /^[\u0600-\u06FF\s]+$/;
      return pattern.test(value) || message || msg('arabicOnly');
    };
  };

  /**
   * English text only
   */
  const englishOnly = (message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      const pattern = /^[a-zA-Z\s]+$/;
      return pattern.test(value) || message || msg('englishOnly');
    };
  };

  /**
   * No special characters
   */
  const noSpecialChars = (message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      const pattern = /^[a-zA-Z0-9\u0600-\u06FF\s]+$/;
      return pattern.test(value) || message || msg('noSpecialChars');
    };
  };

  /**
   * Valid URL
   */
  const url = (message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return message || msg('url');
      }
    };
  };

  // ==================== Password Rules ====================

  /**
   * Strong password
   */
  const strongPassword = (message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return pattern.test(value) || message || msg('strongPassword');
    };
  };

  /**
   * Password confirmation match
   */
  const confirmPassword = (password: string, message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      return value === password || message || msg('confirmPassword');
    };
  };

  // ==================== File Rules ====================

  /**
   * Maximum file size (in MB)
   */
  const maxFileSize = (maxMB: number, message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      const files = Array.isArray(value) ? value : [value];
      const maxBytes = maxMB * 1024 * 1024;
      return files.every((file: File) => file.size <= maxBytes) || message || msg('maxFileSize', { max: maxMB });
    };
  };

  /**
   * Allowed file types
   */
  const allowedFileTypes = (types: string[], message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      const files = Array.isArray(value) ? value : [value];
      return files.every((file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ext && types.map(t => t.toLowerCase()).includes(ext);
      }) || message || msg('allowedFileTypes', { types: types.join(', ') });
    };
  };

  // ==================== Date Rules ====================

  /**
   * Valid date
   */
  const validDate = (message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime()) || message || msg('validDate');
    };
  };

  /**
   * Future date
   */
  const futureDate = (message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      const date = new Date(value);
      return date > new Date() || message || msg('futureDate');
    };
  };

  /**
   * Past date
   */
  const pastDate = (message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      const date = new Date(value);
      return date < new Date() || message || msg('pastDate');
    };
  };

  // ==================== Custom Rules ====================

  /**
   * Custom pattern (Regex)
   */
  const pattern = (regex: RegExp, message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      return regex.test(value) || message || msg('pattern');
    };
  };

  /**
   * Custom validator
   */
  const custom = (validator: (value: any) => boolean, message?: string): ValidationRule => {
    return (value: any) => {
      if (!value) return true;
      return validator(value) || message || msg('pattern');
    };
  };

  return {
    required,
    minLength,
    maxLength,
    exactLength,
    numeric,
    integer,
    minValue,
    maxValue,
    between,
    positive,
    email,
    phone,
    saudiPhone,
    arabicOnly,
    englishOnly,
    noSpecialChars,
    url,
    strongPassword,
    confirmPassword,
    maxFileSize,
    allowedFileTypes,
    validDate,
    futureDate,
    pastDate,
    pattern,
    custom,
  };
}

// ==================== Direct Exports (Auto-import friendly) ====================
// These call useValidators() internally and return the validator functions
// Usage: import { required, minLength } from '@/utils/validators'

// Helper to get validators instance (cached per component)
const getValidators = () => useValidators();

export const required = (messageKey?: string) => getValidators().required(messageKey);
export const minLength = (min: number, message?: string) => getValidators().minLength(min, message);
export const maxLength = (max: number, message?: string) => getValidators().maxLength(max, message);
export const exactLength = (length: number, message?: string) => getValidators().exactLength(length, message);
export const numeric = (message?: string) => getValidators().numeric(message);
export const integer = (message?: string) => getValidators().integer(message);
export const minValue = (min: number, message?: string) => getValidators().minValue(min, message);
export const maxValue = (max: number, message?: string) => getValidators().maxValue(max, message);
export const between = (min: number, max: number, message?: string) => getValidators().between(min, max, message);
export const positive = (message?: string) => getValidators().positive(message);
export const email = (message?: string) => getValidators().email(message);
export const phone = (message?: string) => getValidators().phone(message);
export const saudiPhone = (message?: string) => getValidators().saudiPhone(message);
export const arabicOnly = (message?: string) => getValidators().arabicOnly(message);
export const englishOnly = (message?: string) => getValidators().englishOnly(message);
export const noSpecialChars = (message?: string) => getValidators().noSpecialChars(message);
export const url = (message?: string) => getValidators().url(message);
export const strongPassword = (message?: string) => getValidators().strongPassword(message);
export const confirmPassword = (password: string, message?: string) => getValidators().confirmPassword(password, message);
export const maxFileSize = (maxMB: number, message?: string) => getValidators().maxFileSize(maxMB, message);
export const allowedFileTypes = (types: string[], message?: string) => getValidators().allowedFileTypes(types, message);
export const validDate = (message?: string) => getValidators().validDate(message);
export const futureDate = (message?: string) => getValidators().futureDate(message);
export const pastDate = (message?: string) => getValidators().pastDate(message);
export const pattern = (regex: RegExp, message?: string) => getValidators().pattern(regex, message);
export const custom = (validator: (value: any) => boolean, message?: string) => getValidators().custom(validator, message);
