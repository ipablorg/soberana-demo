import { gql } from '@/graphql/generated';

export const PayinsListByCompanyDocument = gql(`
  query Payin_listByCompanyInCountry($filters: PayinCompanyFiltersInput!) {
    payin_listByCompanyInCountry(filters: $filters) {
      items {
        id
        uid
        type
        Amount
        state
        active
        payInGetWay
        createdAt
        companyName
        productName
        currencyCode
        countryCode
        sourceOfPaymentName
      }
      total
      page
      pageSize
      totalPages
      hasMore
    }
  }
`);
