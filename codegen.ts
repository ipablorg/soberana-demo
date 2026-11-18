import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // Backend schema. Default: the backend's committed src/schema.gql (kept
  // current by every dev-mode boot) so codegen never needs a running backend
  // and works against prod-mode local runs where introspection is disabled.
  // Set CODEGEN_SCHEMA=http://localhost:3000/graphql to use introspection.
  schema:
    process.env.CODEGEN_SCHEMA ||
    '../suite-loopay-back/src/schema.gql',
  
  // Scan for GraphQL operations in these files
  // Excluded: operations that reference backend resolvers not yet implemented
  documents: [
    'src/graphql/**/*.{ts,tsx,graphql}',
    // globalconnectors — módulo separado, no existe en este backend
    '!src/graphql/**/*globalconnectors*',
    '!src/graphql/mutations/globalconnectors/**',
    '!src/graphql/queries/globalconnectors/**',
    // bridge — no implementado aún
    '!src/graphql/queries/bridge/**',
    // ai — no implementado aún
    '!src/graphql/mutations/ai/**',
    // auth - excluido temporalmente hasta que el backend deploye el union type de sign_in
    '!src/graphql/mutations/auth/sign-in.ts',
    // collection — resolvers faltantes en backend
    '!src/graphql/mutations/collection/**',
    '!src/graphql/queries/collection/**',
    // management — resolvers faltantes en backend
    '!src/graphql/mutations/management/**',
    '!src/graphql/queries/management/**',
    // payment — resolvers faltantes en backend
    '!src/graphql/mutations/payment/**',
    '!src/graphql/queries/payment/**',
    // soberana — mutations de beneficiarios no existen en GraphQL (se usan via REST)
    '!src/graphql/mutations/soberana/create-beneficiary.mutation.ts',
    '!src/graphql/mutations/soberana/delete-beneficiary.mutation.ts',
    // drift: backend schema ahead of prod — these return typed entities locally
    // but prod still returns GraphQLJSON. Exclude until backend deploys parity.
    // See docs/graphql-codegen-drift.md
    ],
  
  // Output configuration
  generates: {
    'src/graphql/generated/': {
      preset: 'client',
      plugins: [],
      config: {
        // Map GraphQL scalar types to TypeScript types
        scalars: {
          DateTime: 'string',
        },
        // Optimize generated code
        avoidOptionals: false,
        maybeValue: 'T | null | undefined',
        // Generate typed document nodes
        documentMode: 'documentNode',
      },
      presetConfig: {
        gqlTagName: 'gql',
        fragmentMasking: false,
      },
    },
  },
  
  // Configuration options
  ignoreNoDocuments: true, // Prevents error when no .graphql files exist yet
  overwrite: true,
  verbose: true,
};

export default config;
