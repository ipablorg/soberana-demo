/**
 * GlobalConnectors Validators
 * 
 * Validation functions for payment rail specific fields
 */

export const globalConnectorsValidators = {
  /**
   * Validate ACH routing number (9 digits)
   */
  routingNumber: (value: string): boolean => {
    return /^\d{9}$/.test(value);
  },

  /**
   * Validate IBAN (starts with 2 letters, followed by 2 digits, then alphanumeric)
   */
  iban: (value: string): boolean => {
    return /^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(value.toUpperCase());
  },

  /**
   * Validate CLABE (18 digits - Mexican bank account)
   */
  clabe: (value: string): boolean => {
    return /^\d{18}$/.test(value);
  },

  /**
   * Validate PIX key (can be email, phone, CPF, or random key)
   */
  pixKey: (value: string): boolean => {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isPhone = /^\+\d{10,15}$/.test(value);
    const isCPF = /^\d{11}$/.test(value);
    const isRandomKey = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
    
    return isEmail || isPhone || isCPF || isRandomKey;
  },

  /**
   * Validate BIC/SWIFT code (8 or 11 characters)
   */
  bic: (value: string): boolean => {
    return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i.test(value);
  },

  /**
   * Validate email
   */
  email: (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },
};

