/**
 * Create Breb Key Hook
 *
 * Handles the creation of Breb keys using GraphQL mutation.
 */

import { SaveBrebKey } from '@/graphql/mutations/payment';
import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
import { useAuthStore } from '@/shared/stores/auth-store';

interface CreateBrebKeyParams {
  partyIdentifier: string;
  phoneNumber: string;
}

interface CreateBrebKeyResponse {
  success: boolean;
  message: string;
  brebKey: string;
}

/**
 * Extract user-friendly error message from GraphQL error
 */
const extractErrorMessage = (error: any): string => {
  const errorMessage = 
    error?.message || 
    error?.errors?.[0]?.message || 
    error?.graphQLErrors?.[0]?.message ||
    'Error desconocido al crear la llave Breb';

  // Check for specific error codes
  if (errorMessage.includes('DU05') || errorMessage.includes('ya se encuentra registrada')) {
    return 'Esta llave ya está registrada en el sistema. Por favor, usa un identificador diferente (ej: @tuempresa_001).';
  }

  if (errorMessage.includes('MoviiBreB')) {
    // Extract the actual error message from MoviiBreB if available
    const match = errorMessage.match(/"message":"([^"]+)"/);
    if (match && match[1]) {
      return `Error de MoviiBreB: ${match[1]}`;
    }
  }

  return errorMessage;
};

export function useCreateBrebKey() {
  const mutation = useGraphQLMutation(SaveBrebKey as any, {
    onSuccess: () => {},
    onError: (error) => {
      console.error('[✗] Breb key creation failed:', error);
    },
  });

  const createBrebKey = async ({
    partyIdentifier,
    phoneNumber,
  }: CreateBrebKeyParams): Promise<CreateBrebKeyResponse | null> => {
    const authState = useAuthStore.getState();
    const companyProductId = authState.user?.company_user[0]?.company?.CompanyProduct?.[0]?.id;

    if (!companyProductId) {
      return {
        success: false,
        message: 'No se encontró el producto de la compañía',
        brebKey: '',
      };
    }

    try {
      const result = await mutation.mutateAsync({
        input: {
          companyProductId,
          partyIdentifier,
          phoneNumber,
        },
      });

      const mutationResponse = (result as any)?.companies_saveBrebKeyToCompanyProduct;
      
      // Update auth store with new metadata
      if (mutationResponse?.metaData) {
        const currentUser = authState.user;
        if (currentUser?.company_user?.[0]?.company?.CompanyProduct?.[0]) {
          currentUser.company_user[0].company.CompanyProduct[0].metaData = mutationResponse.metaData;
          useAuthStore.setState({ user: currentUser });
        }
      }

      return {
        success: true,
        message: 'Llave Breb creada',
        brebKey: partyIdentifier,
      };
    } catch (err) {
      console.error('[✗] Mutation error:', err);
      
      const errorMessage = extractErrorMessage(err);
      
      return {
        success: false,
        message: errorMessage,
        brebKey: '',
      };
    }
  };

  const reset = () => {
    mutation.reset();
  };

  return {
    createBrebKey,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
    reset,
  };
}
