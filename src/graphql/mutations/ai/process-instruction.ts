/**
 * AI Module - Process Instruction Mutation
 *
 * Sends user text to AI backend for NLP.
 * Returns extracted intent, confidence score, and parameters.
 *
 * Guarded by VITE_FEATURE_AI env var — set to "true" to enable.
 */

import { gql } from '@/graphql/generated';

export const ProcessInstructionDocument = gql(`
  mutation ProcessInstruction($input: ProcessInstructionInput!) {
    ai_processInstruction(input: $input) {
      intent
      confidence
      extractedParams
      suggestedAction
    }
  }
`);
