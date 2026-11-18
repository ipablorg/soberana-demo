/**
 * Commercial dual user document contract (epic 2026-11 S4/S5).
 *
 * The staff invite of a client's tenant admin and the `acting_as` selection
 * that drives the act-as banner are hand-written; this proves they validate
 * against the back's committed schema (`apps/suite-loopay-back/src/schema.gql`,
 * the file codegen reads) and select what the screens render.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { buildSchema, print, validate } from 'graphql';
import { describe, expect, it } from 'vitest';

import { InviteTenantAdminDocument } from '@/graphql/mutations/admin-loopay';
import { TenantMeDocument } from '@/graphql/queries/tenant';

const schema = buildSchema(
  readFileSync(resolve(process.cwd(), '../suite-loopay-back/src/schema.gql'), 'utf8')
);

describe('commercial dual user documents', () => {
  it('invites a tenant admin by client id and email and reads the one-time link', () => {
    expect(validate(schema, InviteTenantAdminDocument).map((error) => error.message)).toEqual([]);

    const printed = print(InviteTenantAdminDocument);
    expect(printed).toContain('adminLoopay_inviteTenantAdmin(clientId: $clientId, input: $input)');
    expect(printed).toContain('$input: InviteTenantAdminInput!');
    expect(printed).toContain('password_setup_link');
    expect(printed).toContain('email');
  });

  it('asks tenant_me who is acting (staff email and roles) for the act-as banner', () => {
    expect(validate(schema, TenantMeDocument).map((error) => error.message)).toEqual([]);

    const printed = print(TenantMeDocument).replace(/\s+/g, ' ');
    expect(printed).toContain('acting_as { staff_email staff_roles }');
  });
});
