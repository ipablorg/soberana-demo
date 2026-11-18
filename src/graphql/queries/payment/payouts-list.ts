import { gql } from '@/graphql/generated';

export const PayoutsListByCountryDocument = gql(`
  query Payout_listByCountry($filters: PayoutFiltersInput!) {
    payout_listByCountry(filters: $filters) {
      payouts {
        id
        uid
        Amount
        state
        createdAt
        scheduledAt
        trasnferedAt
        companyName
        productName
        beneficiaryName
        documentNumber
        bankName
        email
        phone
        countryCode
        currencyCode
        gateway
        externalIdentifier
        fixedFee
        percentageFee
      }
      total
      page
      pageSize
      totalPages
      hasMore
    }
  }
`);
