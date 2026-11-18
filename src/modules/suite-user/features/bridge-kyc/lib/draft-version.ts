export const DRAFT_VERSION = 3;

export interface DraftMetadata {
  version: number;
  timestamp: number;
}

export function createDraftMetadata(): DraftMetadata {
  return {
    version: DRAFT_VERSION,
    timestamp: Date.now(),
  };
}

export function isDraftVersionValid(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== 'object') {
    return false;
  }

  const meta = metadata as Partial<DraftMetadata>;
  return meta.version === DRAFT_VERSION;
}
