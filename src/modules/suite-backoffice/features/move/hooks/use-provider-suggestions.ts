/**
 * Provider suggestions for the deposit queue filters.
 *
 * `adminLoopay_listProviders` needs PLATFORM_ADMIN, which the staff roles that
 * see this queue may not hold, so the suggestions are learnt from the rows the
 * queue has loaded (see `mergeProviderCodes`) and kept while filters narrow it.
 */

import { useEffect, useState } from 'react';

import type { AdminRecaudo } from '@/graphql/types/admin-loopay';

import { mergeProviderCodes } from '../lib/facet-options';

export function useProviderSuggestions(
  rows: readonly Pick<AdminRecaudo, 'provider_code'>[],
): string[] {
  const [known, setKnown] = useState<string[]>([]);

  useEffect(() => {
    setKnown((current) => mergeProviderCodes(current, rows));
  }, [rows]);

  return known;
}
