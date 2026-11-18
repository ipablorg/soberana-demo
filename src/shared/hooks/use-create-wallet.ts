import { useQueryClient } from '@tanstack/react-query';
import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
import { WalletsCreate } from '@/graphql/mutations/soberana/wallets-create.mutation';

export function useCreateWallet() {
  const queryClient = useQueryClient();

  return useGraphQLMutation(WalletsCreate as any, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets', 'list'] });
    },
  });
}
