/**
 * Public surface of the Receive feature.
 *
 * `ReceiveFlow` is the only thing external callers should import; the
 * subcomponents and hooks are implementation details. We re-export the
 * `UserAccount` type because it's a useful shape for tests or any
 * future consumer that wants to build its own UI around the same
 * account model (e.g. transaction detail, history filters).
 */

export { ReceiveFlow } from './receive-flow';
export type { ReceiveFlowProps } from './receive-flow';
export type { UserAccount, UserAccountStatus } from './hooks/use-user-accounts';
