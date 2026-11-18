/**
 * Public surface of the Send feature.
 *
 * `SendFlow` is the only thing external callers should import; the
 * subcomponents and hooks are implementation details. `SendFlowWallet`
 * is re-exported because it's a stable shape consumer code can build
 * against without reaching into the hook file.
 */

export { SendFlow } from './send-flow';
export type { SendFlowProps } from './send-flow';
export type { SendFlowWallet } from './hooks/use-send-flow';
