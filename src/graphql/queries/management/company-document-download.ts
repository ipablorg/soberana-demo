/**
 * Company Document Download URL Query
 * Fetches a signed URL to download a company document
 */

import { gql } from '@/graphql/generated';

export const CompanyDocumentDownloadUrlDocument = gql(`
  query companies_getDocumentDownloadUrl($uploadDocId: String!) {
    companies_getDocumentDownloadUrl(uploadDocId: $uploadDocId)
  }
`);
