export function isSandboxRuntime(): boolean {
  const graphqlUrl = (import.meta.env.VITE_GRAPHQL_URL as string | undefined) ?? '';

  return graphqlUrl.toLowerCase().includes('sandbox');
}
