import { describe, expect, it } from 'vitest';
import { buildSelfUboPrefill, selfUboPrefillPatch } from '../ubo-self-prefill';

describe('buildSelfUboPrefill', () => {
  it('splits the known full name and keeps the email', () => {
    expect(
      buildSelfUboPrefill({ name: 'Ana María Pérez Gómez', email: 'ana@example.com' })
    ).toEqual({
      first_name: 'Ana',
      last_name: 'María Pérez Gómez',
      email: 'ana@example.com',
    });
  });

  it('handles a single-word name and surrounding whitespace', () => {
    expect(buildSelfUboPrefill({ name: '  Ana ', email: ' ana@example.com ' })).toEqual({
      first_name: 'Ana',
      last_name: '',
      email: 'ana@example.com',
    });
  });

  it('returns null when nothing is known about the user', () => {
    expect(buildSelfUboPrefill(null)).toBeNull();
    expect(buildSelfUboPrefill({ name: '', email: '' })).toBeNull();
  });
});

describe('selfUboPrefillPatch', () => {
  const prefill = { first_name: 'Ana', last_name: 'Ruiz Gómez', email: 'ana@acme.test' };

  it('fills only the empty fields and never blanks what the user typed', () => {
    expect(
      selfUboPrefillPatch({ first_name: 'Ana María', last_name: '', email: ' ' }, prefill)
    ).toEqual({ last_name: 'Ruiz Gómez', email: 'ana@acme.test' });
  });

  it('never writes an empty prefill value over a typed one', () => {
    expect(
      selfUboPrefillPatch(
        { first_name: '', last_name: 'Pérez', email: '' },
        { first_name: 'Ana', last_name: '', email: 'ana@acme.test' }
      )
    ).toEqual({ first_name: 'Ana', email: 'ana@acme.test' });
  });
});
