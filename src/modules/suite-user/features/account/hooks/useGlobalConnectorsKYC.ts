/**
 * useGlobalConnectorsKYC Hook
 * 
 * Manages GlobalConnectors KYC verification process.
 * 
 * Features:
 * - Create customer mutation
 * - Auto-open KYC link in new tab
 * - Loading and error states
 * - User data auto-fill
 */

import { useLingui } from '@lingui/react/macro';
import { useAuth } from '@/shared/hooks/use-auth';
import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
import { CreateGlobalConnectorsCustomerDocument } from '@/graphql/mutations/globalconnectors/create-customer.mutation';
import { toast } from '@/shared/hooks/use-toast';
import { setCompanyHeader } from '@/shared/lib/graphql-client';

export type GlobalConnectorsKYCStatus = 'NOT_STARTED' | 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export function useGlobalConnectorsKYC() {
  const { t } = useLingui();
  const { user } = useAuth();
  
  // Get company ID from first company
  const companyId = user?.company_user?.[0]?.company?.id;
  
  const mutation = useGraphQLMutation(CreateGlobalConnectorsCustomerDocument);

  /**
   * Start KYC Process
   * 
   * 1. Sets company header
   * 2. Creates customer in GlobalConnectors backend
   * 3. Opens KYC link in new tab
   * 4. Handles errors gracefully
   */
  const startKYC = async () => {
    if (!user?.email) {
      toast({
        variant: 'destructive',
        title: t`Algo salió mal`,
        description: t`No encontramos tu información de usuario — intenta iniciar sesión de nuevo.`,
      });
      return;
    }

    if (!companyId) {
      toast({
        variant: 'destructive',
        title: t`Algo salió mal`,
        description: t`No encontramos tu empresa asociada — contacta a soporte.`,
      });
      return;
    }

    // Get company name or use user name as fallback
    const fullName = user.company_user?.[0]?.company?.name || user.name || user.email;

    try {
      // Set company header before making the request
      setCompanyHeader(String(companyId));
      
      const result = await mutation.mutateAsync({
        input: {
          email: user.email,
          type: 'BUSINESS',
          fullName: fullName,
        },
      });

      const kycLink = result.globalconnectors_createCustomer.kycLink;

      if (!kycLink) {
        throw new Error('No se recibió el enlace de verificación KYC');
      }

      // Open KYC link in new tab
      window.open(kycLink, '_blank', 'noopener,noreferrer');

      toast({
        title: t`Verificación iniciada`,
        description: t`Abrimos una ventana para completar tu verificación KYC.`,
      });
    } catch (error: any) {
      console.error('[useGlobalConnectorsKYC] Error starting KYC:', error);
      
      // Check if KYC was already initiated
      const errorMessage = error?.message || error?.response?.errors?.[0]?.message || '';
      const isKYCAlreadyCreated = errorMessage.includes('kyc link has already been created');
      const isNullFieldError = errorMessage.includes('Cannot return null for non-nullable field');
      
      if (isKYCAlreadyCreated) {
        // Try to extract existing kycLink from error response
        const existingKycLink = error?.response?.data?.globalconnectors_createCustomer?.kycLink;
        
        if (existingKycLink) {
          // Open existing KYC link
          window.open(existingKycLink, '_blank', 'noopener,noreferrer');
          
          toast({
            title: t`Verificación ya iniciada`,
            description: t`Ya tienes un proceso en curso — abrimos tu enlace de verificación.`,
          });
        } else {
          toast({
            variant: 'default',
            title: t`Verificación ya iniciada`,
            description: t`Ya tienes un proceso en curso. Si no encuentras el enlace, contacta a soporte.`,
          });
        }
      } else if (isNullFieldError) {
        // Backend data integrity issue
        toast({
          variant: 'destructive',
          title: t`Algo salió mal`,
          description: t`No pudimos completar la operación — contacta a soporte técnico.`,
        });
      } else {
        // Generic error handling
        toast({
          variant: 'destructive',
          title: t`No pudimos iniciar la verificación`,
          description: t`Intenta de nuevo en unos segundos, o contacta a soporte.`,
        });
      }
    }
  };

  return {
    // Actions
    startKYC,
    
    // States
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    
    // User info
    userEmail: user?.email,
    userFullName: user?.company_user?.[0]?.company?.name || user?.name,
    companyId,
  };
}
