import { gql } from '@/graphql/generated';

export const PayinGetVoucherDownloadUrlDocument = gql(`
  query GetVoucherDownloadUrl($payinId: Int!) {
    payin_getVoucherDownloadUrl(payinId: $payinId)
  }
`);
