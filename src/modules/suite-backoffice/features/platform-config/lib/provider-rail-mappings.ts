/**
 * Pure helpers for the provider <-> rail assignment form.
 *
 * The backend rejects a duplicate (provider, rail) pair with a unique
 * constraint, so the form checks the already-loaded mappings up front instead
 * of letting the operator hit that error.
 */

interface MappingLike {
  provider: { id: string };
  rail: { id: string };
}

interface RailLike {
  id: string;
}

export interface RailOption<TRail extends RailLike> {
  rail: TRail;
  /** True when the rail is already mapped to the chosen provider (active or not). */
  assigned: boolean;
}

/** The mapping that joins `providerId` and `railId`, if any (active or not). */
export function findExistingMapping<TMapping extends MappingLike>(
  rows: readonly TMapping[],
  providerId: string,
  railId: string,
): TMapping | undefined {
  if (!providerId || !railId) return undefined;

  return rows.find(
    (row) => row.provider.id === providerId && row.rail.id === railId,
  );
}

/**
 * Every rail, in its original order, flagged when it is already assigned to
 * the provider. Nothing is flagged until a provider is chosen. Assigned rails
 * are kept (not dropped) so the UI can show why they cannot be picked.
 */
export function availableRailsForProvider<TRail extends RailLike>(
  rails: readonly TRail[],
  rows: readonly MappingLike[],
  providerId: string,
): RailOption<TRail>[] {
  const assignedRailIds = new Set(
    providerId
      ? rows
          .filter((row) => row.provider.id === providerId)
          .map((row) => row.rail.id)
      : [],
  );

  return rails.map((rail) => ({ rail, assigned: assignedRailIds.has(rail.id) }));
}
