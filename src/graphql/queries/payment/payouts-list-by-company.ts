import { gql } from '@/graphql/generated';

export const PayoutsListByCompanyDocument = gql(`
  query Payout_listByCompanyInCountry($filters: PayoutCompanyFiltersInput!) {
    payout_listByCompanyInCountry(filters: $filters) {
      payouts {
        id
        uid
        state
        Amount
        createdAt
        beneficiaryName
        documentNumber
        email
        phone
        externalIdentifier
        gateway
        fixedFee
        percentageFee
        companyName
        bankName
        productName
        currencyCode
        countryCode
      }
      total
      page
      pageSize
      totalPages
      hasMore
    }
  }
`);
