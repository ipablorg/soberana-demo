import { gql } from '@/graphql/generated';

export const PayInsListByCountryDocument = gql(`
  query PayIns_listByCountry($filters: PayinFiltersInput!) {
    payin_listByCountry(filters: $filters) {
        page
        pageSize
        total
        totalPages
        items {
          id
          uid
          type
          state
          createdAt
          Amount
          companyName
          productName
          creatorUserName
          payInGetWay
          active
          fileUrl
        }
    }
  }
`);
