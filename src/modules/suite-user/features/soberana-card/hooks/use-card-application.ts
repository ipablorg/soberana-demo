/**
 * useCardApplication — writes a card application document to the
 * Loopay X Firestore project (collection `card_aplications`).
 *
 * Exposed as a plain pending/success/error hook (not TanStack Query)
 * because it's a one-shot command with no cacheable result.
 */

import { useCallback, useState } from 'react';

import { getDb } from '@/shared/lib/loopayx/firebase-client';
import { mapError } from '@/shared/lib/error-mapper';
import type { MappedError } from '@/shared/lib/error-mapper';

export interface CardApplicationInput {
  user_id: string;
  email: string;
  name: string;
}

export function useCardApplication() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<MappedError | null>(null);

  const apply = useCallback(
    async (input: CardApplicationInput): Promise<boolean> => {
      setIsPending(true);
      setError(null);
      try {
        const db = await getDb();
        const { collection, addDoc, serverTimestamp } = await import(
          'firebase/firestore'
        );
        await addDoc(collection(db, 'card_aplications'), {
          user_id: input.user_id,
          email: input.email,
          name: input.name,
          status: 'pending',
          created_at: serverTimestamp(),
        });
        setIsSuccess(true);
        return true;
      } catch (err) {
        setError(mapError(err));
        return false;
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return { apply, isPending, isSuccess, error };
}
