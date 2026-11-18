/**
 * useMigratedUser Hook
 * 
 * Detects if user is a migrated user from old onboarding system.
 * Migrated users need to complete Bridge KYC for compliance.
 */

import { useAuth } from '@/shared/hooks/use-auth';

const MIGRATION_DATE = '2025-12-23';

export function useMigratedUser() {
  const { user } = useAuth();
  
  if (!user) {
    return {
      isMigratedUser: false,
      isLoading: true,
    };
  }

  const createdAtCandidate = (user as { createdAt?: string; created_at?: string | null }).createdAt
    ?? (user as { createdAt?: string; created_at?: string | null }).created_at
    ?? null;

  if (!createdAtCandidate) {
    return {
      isMigratedUser: false,
      isLoading: false,
    };
  }

  const userCreatedAt = new Date(createdAtCandidate);
  const migrationDate = new Date(MIGRATION_DATE);
  const isMigratedUser = userCreatedAt < migrationDate;

  return {
    isMigratedUser,
    isLoading: false,
  };
}
