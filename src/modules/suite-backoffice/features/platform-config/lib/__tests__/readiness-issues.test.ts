import { describe, expect, it } from 'vitest';

import { readinessIssueKeyLabel, readinessIssueLabel } from '../readiness-issues';

/** Resolves a Lingui descriptor the way `i18n._` does for the source locale. */
const t = (d: { message?: string; id?: string; values?: Record<string, unknown> }) =>
  (d.message ?? d.id ?? '').replace(/\{(\w+)\}/g, (_, key: string) =>
    String(d.values?.[key] ?? `{${key}}`)
  );

describe('readinessIssueLabel', () => {
  it.each([
    [
      'No active client provider rail to a live provider: customers_addEndorsement rejects every rail for this client',
      'El cliente no tiene ningún riel activo con un proveedor vigente: no se puede habilitar ningún riel para sus customers',
    ],
    [
      '2 active junction(s) still point to dead providers: run the dead-provider cutover for this client',
      '2 relaciones activas apuntan a proveedores retirados: ejecuta el cutover de proveedores retirados para este cliente',
    ],
    [
      'Wallet defaults missing in client.config.defaults: walletProviderId, walletDefaultChain',
      'Faltan los valores por defecto de billetera: proveedor de billetera, cadena por defecto',
    ],
    ["No active junction to active provider 'mesta'", 'Sin relación activa con el proveedor mesta'],
    [
      'walletProviderId 1234 matches no provider: wallet minting falls back to the openfort row',
      'El proveedor de billetera configurado (1234) no existe: se usará el proveedor de custodia por defecto para crear billeteras',
    ],
    [
      'No wallet provider resolvable (junction, walletProviderId or openfort row): KYC approval cannot mint wallets',
      'No hay proveedor de billetera: al aprobar el KYC no se podrán crear billeteras',
    ],
    ["Wallet provider 'openfort' is inactive", 'El proveedor de billetera openfort está inactivo'],
    [
      "Wallet provider 'openfort' has no config.wallet (chains, defaultChain): wallet minting fails with PROVIDER_NOT_CONFIGURED",
      'El proveedor de billetera openfort no tiene cadenas configuradas: la creación de billeteras fallará',
    ],
    [
      "Wallet chain 'tron' is not in config.wallet.chains of provider 'openfort': wallet minting fails with INVALID_CHAIN",
      'La cadena tron no está habilitada en el proveedor openfort: la creación de billeteras fallará',
    ],
  ])('translates %s', (issue, expected) => {
    expect(readinessIssueLabel(issue, t)).toBe(expected);
  });

  it('returns an unknown issue unchanged', () => {
    expect(readinessIssueLabel('Something new', t)).toBe('Something new');
  });
});

describe('readinessIssueKeyLabel (#411: issue_keys with params)', () => {
  it.each([
    [
      { key: 'readiness.no_live_rail', params: {} },
      'El cliente no tiene ningún riel activo con un proveedor vigente: no se puede habilitar ningún riel para sus customers',
    ],
    [
      { key: 'readiness.dead_provider_junctions', params: { count: 2 } },
      '2 relaciones activas apuntan a proveedores retirados: ejecuta el cutover de proveedores retirados para este cliente',
    ],
    [
      {
        key: 'readiness.wallet_defaults_missing',
        params: { fields: ['walletProviderId', 'walletDefaultChain'] },
      },
      'Faltan los valores por defecto de billetera: proveedor de billetera, cadena por defecto',
    ],
    [
      { key: 'readiness.wallet_provider_id_unknown', params: { walletProviderId: '1234' } },
      'El proveedor de billetera configurado (1234) no existe: se usará el proveedor de custodia por defecto para crear billeteras',
    ],
    [
      { key: 'readiness.no_wallet_provider', params: {} },
      'No hay proveedor de billetera: al aprobar el KYC no se podrán crear billeteras',
    ],
    [
      { key: 'readiness.wallet_provider_inactive', params: { provider: 'openfort' } },
      'El proveedor de billetera openfort está inactivo',
    ],
    [
      { key: 'readiness.wallet_provider_not_configured', params: { provider: 'openfort' } },
      'El proveedor de billetera openfort no tiene cadenas configuradas: la creación de billeteras fallará',
    ],
    [
      {
        key: 'readiness.wallet_chain_unsupported',
        params: { chain: 'TRON', provider: 'openfort' },
      },
      'La cadena TRON no está habilitada en el proveedor openfort: la creación de billeteras fallará',
    ],
    [
      { key: 'readiness.provider_not_onboarded', params: { provider: 'mesta' } },
      'El cliente no está registrado en mesta, que sus rieles habilitados necesitan',
    ],
  ])('labels %j', (issue, expected) => {
    expect(readinessIssueKeyLabel(issue, t)).toBe(expected);
  });

  it('falls back to the English text for an unknown key', () => {
    expect(readinessIssueKeyLabel({ key: 'readiness.new_thing', params: {} }, t, 'New thing')).toBe(
      'New thing'
    );
    expect(readinessIssueKeyLabel({ key: 'readiness.new_thing', params: {} }, t)).toBe(
      'readiness.new_thing'
    );
  });
});
