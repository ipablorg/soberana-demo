/**
 * Bank Account Types (Bridge API Format)
 * 
 * Tipos alineados 100% con la documentación de Bridge API.
 * Fuente: bridge-api-documentation.json
 */

/**
 * Account Type (Bridge API)
 * Determina el país/región de la cuenta
 * 
 * NOTE: 'co' (Colombia) está documentado pero NO confirmado en external_accounts
 * de Bridge API. Incluido aquí para preparación futura.
 */
export type BridgeAccountType = 'us' | 'mx' | 'br' | 'iban' | 'co';

/**
 * Bank Account Status
 */
export type BankAccountStatus = 'active' | 'pending' | 'inactive' | 'blocked';

/**
 * PIX Key Types (Brazil)
 */
export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

/**
 * USA Account Details
 */
export interface USAccountDetails {
  account_number: string;
  routing_number: string;
  account_owner_name: string;
}

/**
 * Mexico SPEI Account Details
 */
export interface MexicoAccountDetails {
  clabe: string; // 18 dígitos
  account_owner_name: string;
}

/**
 * Brazil PIX Account Details
 */
export interface BrazilAccountDetails {
  pix_key: string;
  pix_key_type: PixKeyType;
  account_owner_name: string;
}

/**
 * Colombia Account Details
 * NOTA: Formato tentativo basado en documentación de regiones.
 * Pendiente de confirmación con backend sobre campos exactos.
 */
export interface ColombiaAccountDetails {
  account_number: string;
  bank_code: string; // Código del banco (ej: Bancolombia, Davivienda)
  document_type: 'CC' | 'CE' | 'NIT' | 'Pasaporte'; // Tipo de documento
  document_number: string; // Número de documento
  account_owner_name: string;
}

/**
 * IBAN/SEPA Account Details
 */
export interface IBANAccountDetails {
  account_number: string; // IBAN completo
  bic: string;           // BIC/SWIFT code
  account_owner_name: string;
}

/**
 * Create Bank Account Input - USA
 * 
 * @example
 * ```json
 * {
 *   "account_type": "us",
 *   "account": {
 *     "account_number": "123456789",
 *     "routing_number": "021000021",
 *     "account_owner_name": "John Doe"
 *   }
 * }
 * ```
 */
export interface CreateUSBankAccountInput {
  account_type: 'us';
  account: USAccountDetails;
}

/**
 * Create Bank Account Input - Mexico SPEI
 * 
 * @example
 * ```json
 * {
 *   "account_type": "mx",
 *   "account": {
 *     "clabe": "012180015000000001",
 *     "account_owner_name": "Juan Pérez"
 *   }
 * }
 * ```
 */
export interface CreateMXBankAccountInput {
  account_type: 'mx';
  account: MexicoAccountDetails;
}

/**
 * Create Bank Account Input - Brazil PIX
 * 
 * @example
 * ```json
 * {
 *   "account_type": "br",
 *   "account": {
 *     "pix_key": "12345678900",
 *     "pix_key_type": "cpf",
 *     "account_owner_name": "João Silva"
 *   }
 * }
 * ```
 */
export interface CreateBRBankAccountInput {
  account_type: 'br';
  account: BrazilAccountDetails;
}

/**
 * Create Bank Account Input - IBAN/SEPA
 * 
 * @example
 * ```json
 * {
 *   "account_type": "iban",
 *   "iban": {
 *     "account_number": "DE89370400440532013000",
 *     "bic": "COBADEFFXXX",
 *     "account_owner_name": "Hans Mueller"
 *   }
 * }
 * ```
 */
export interface CreateIBANBankAccountInput {
  account_type: 'iban';
  iban: IBANAccountDetails;
}

/**
 * Create Bank Account Input - Colombia
 * 
 * ⚠️ ADVERTENCIA: Formato TENTATIVO
 * Colombia está en la documentación de Bridge pero NO confirmado
 * en external_accounts. Confirmar con backend antes de usar.
 * 
 * @example
 * ```json
 * {
 *   "account_type": "co",
 *   "account": {
 *     "account_number": "123456789",
 *     "bank_code": "BANCOLOMBIA",
 *     "document_type": "CC",
 *     "document_number": "1234567890",
 *     "account_owner_name": "Carlos Rodríguez"
 *   }
 * }
 * ```
 */
export interface CreateCOBankAccountInput {
  account_type: 'co';
  account: ColombiaAccountDetails;
}

/**
 * Create Bank Account Input (Union Type)
 * Bridge API espera uno de estos formatos según el país
 */
export type CreateBankAccountInput =
  | CreateUSBankAccountInput
  | CreateMXBankAccountInput
  | CreateBRBankAccountInput
  | CreateIBANBankAccountInput
  | CreateCOBankAccountInput;

/**
 * Bank Account Entity (Response from Backend)
 * Representa una cuenta bancaria almacenada
 */
export interface BankAccount {
  id: string;
  customer_id: string;
  account_type: BridgeAccountType;
  status: BankAccountStatus;
  created_at: string;
  
  // USA specific
  account?: {
    last_4: string;
    routing_number: string;
    account_owner_name: string;
  };
  
  // IBAN specific
  iban?: {
    last_4: string;
    bic: string;
    account_owner_name: string;
  };
  
  // Mexico specific (dentro de account con clabe_last4)
  // Brazil specific (dentro de account con pix_key info)
}

/**
 * Form Data Interface
 * Datos del formulario antes de transformar al formato Bridge
 */
export interface BankAccountFormData {
  country: 'us' | 'mx' | 'br' | 'iban' | 'co';
  account_owner_name: string;
  
  // USA
  account_number?: string;
  routing_number?: string;
  
  // Mexico
  clabe?: string;
  
  // Brazil
  pix_key?: string;
  pix_key_type?: PixKeyType;
  
  // IBAN
  iban_number?: string;
  bic?: string;
  
  // Colombia
  co_account_number?: string;
  co_bank_code?: string;
  co_document_type?: 'CC' | 'CE' | 'NIT' | 'Pasaporte';
  co_document_number?: string;
}

/**
 * Helper: Transform form data to Bridge API format
 */
export function transformToBridgeFormat(formData: BankAccountFormData): CreateBankAccountInput {
  switch (formData.country) {
    case 'us':
      return {
        account_type: 'us',
        account: {
          account_number: formData.account_number!,
          routing_number: formData.routing_number!,
          account_owner_name: formData.account_owner_name,
        },
      };
    
    case 'mx':
      return {
        account_type: 'mx',
        account: {
          clabe: formData.clabe!,
          account_owner_name: formData.account_owner_name,
        },
      };
    
    case 'br':
      return {
        account_type: 'br',
        account: {
          pix_key: formData.pix_key!,
          pix_key_type: formData.pix_key_type!,
          account_owner_name: formData.account_owner_name,
        },
      };
    
    case 'iban':
      return {
        account_type: 'iban',
        iban: {
          account_number: formData.iban_number!,
          bic: formData.bic!,
          account_owner_name: formData.account_owner_name,
        },
      };
    
    case 'co':
      return {
        account_type: 'co',
        account: {
          account_number: formData.co_account_number!,
          bank_code: formData.co_bank_code!,
          document_type: formData.co_document_type!,
          document_number: formData.co_document_number!,
          account_owner_name: formData.account_owner_name,
        },
      };
  }
}
