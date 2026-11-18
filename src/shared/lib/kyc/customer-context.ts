import type { SupportedCustomerType } from './static-catalog';

const CUSTOMER_TYPE_STORAGE_KEY = 'loopay_customer_type';
const BUSINESS_NAME_STORAGE_KEY = 'loopay_business_name';
const CUSTOMER_TYPE_REGISTRY_KEY = 'loopay_customer_type_registry';

function getRegistry(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CUSTOMER_TYPE_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRegistry(registry: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CUSTOMER_TYPE_REGISTRY_KEY, JSON.stringify(registry));
}

export function saveCustomerTypeForEmail(email: string, customerType: string): void {
  const registry = getRegistry();
  registry[email] = customerType;
  saveRegistry(registry);
}

export function getCustomerTypeForEmail(email: string): SupportedCustomerType | null {
  const registry = getRegistry();
  const value = registry[email];
  return value === 'business' || value === 'individual' ? value : null;
}

export function clearCustomerTypeRegistry(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CUSTOMER_TYPE_REGISTRY_KEY);
}

export function storeCustomerContext(input: {
  customerType?: string | null;
  businessName?: string | null;
  email?: string | null;
}): void {
  if (typeof window === 'undefined') return;

  if (input.customerType) {
    window.localStorage.setItem(CUSTOMER_TYPE_STORAGE_KEY, input.customerType);

    if (input.email) {
      saveCustomerTypeForEmail(input.email, input.customerType);
    }
  }

  if (input.businessName) {
    window.localStorage.setItem(BUSINESS_NAME_STORAGE_KEY, input.businessName);
  } else if (input.customerType !== 'business') {
    window.localStorage.removeItem(BUSINESS_NAME_STORAGE_KEY);
  }
}

export function getStoredCustomerType(): SupportedCustomerType | null {
  if (typeof window === 'undefined') return null;

  const value = window.localStorage.getItem(CUSTOMER_TYPE_STORAGE_KEY);
  return value === 'business' || value === 'individual' ? value : null;
}

export function getStoredBusinessName(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(BUSINESS_NAME_STORAGE_KEY);
}

export function clearStoredCustomerContext(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CUSTOMER_TYPE_STORAGE_KEY);
  window.localStorage.removeItem(BUSINESS_NAME_STORAGE_KEY);
}
