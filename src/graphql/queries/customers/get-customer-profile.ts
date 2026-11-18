import { gql } from 'graphql-request';

export interface CustomerProfileAddress {
  address_line_1?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
}

export interface CustomerProfile {
  business_name?: string | null;
  customer_type?: string;
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  kyc_status: string;
  customer_status?: string | null;
  country?: string | null;
  tax_id?: string | null;
  tax_id_type?: string | null;
  address?: CustomerProfileAddress | null;
}

export interface GetCustomerProfileQuery {
  customers_findById: CustomerProfile;
}

export interface GetCustomerProfileQueryVariables {
  id: string;
}

export const GetCustomerProfileDocument = gql`
  query GetCustomerProfile($id: String!) {
    customers_findById(id: $id) {
      id
      email
      customer_type
      business_name
      first_name
      last_name
      kyc_status
      customer_status
      country
      tax_id
      tax_id_type
      address
    }
  }
`;
