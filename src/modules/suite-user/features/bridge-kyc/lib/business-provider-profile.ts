/**
 * Business data virtual-account providers (Mesta, KiraFin) need beyond the
 * KYB basics. Asked once in the company step so operations never has to ask
 * the customer again.
 */

/** Same ranges the backend validates (`ONBOARDING_NUMBER_OF_EMPLOYEES`). */
export const EMPLOYEE_RANGE_OPTIONS = ['1', '2-10', '11-50', '51-200', '201-1000', '1000+'] as const;

export type EmployeeRange = (typeof EMPLOYEE_RANGE_OPTIONS)[number];
