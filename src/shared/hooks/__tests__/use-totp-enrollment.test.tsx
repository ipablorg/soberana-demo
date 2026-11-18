/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTotpEnrollment } from '../use-totp-enrollment';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const fakeUser = { uid: 'uid-1', email: 'dana@soberana.app' };

const fakeSecret = {
  generateQrCodeUrl: (label: string, issuer: string) =>
    `otpauth://totp/${issuer}:${label}?secret=ABC`,
  secretKey: 'A1B2C3D4E5F6G7H8',
};

const enrollMock = vi.fn(async () => undefined);
const getSessionMock = vi.fn(async () => 'mf-session');
const generateSecretMock = vi.fn(async () => fakeSecret);
const assertionForEnrollmentMock = vi.fn(() => ({ kind: 'assertion' }));

vi.mock('@/shared/lib/loopayx/firebase-client', () => ({
  getAuth: async () => ({ currentUser: fakeUser }),
}));

vi.mock('firebase/auth', () => ({
  multiFactor: () => ({
    getSession: getSessionMock,
    enroll: enrollMock,
  }),
  TotpMultiFactorGenerator: {
    generateSecret: generateSecretMock,
    assertionForEnrollment: assertionForEnrollmentMock,
  },
}));

type ProbeState = ReturnType<typeof useTotpEnrollment>;

let probe: ProbeState | null = null;

function Probe({ accountEmail, onEnrolled }: { accountEmail?: string | null; onEnrolled?: () => void }) {
  probe = useTotpEnrollment({ accountEmail, onEnrolled });
  return null;
}

const mountedRoots: { container: HTMLDivElement; root: Root }[] = [];

async function render(ui: ReactNode) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(ui);
  });
  mountedRoots.push({ container, root });
  return { container, root };
}

afterEach(async () => {
  while (mountedRoots.length > 0) {
    const mounted = mountedRoots.pop();
    if (!mounted) continue;
    await act(async () => {
      mounted.root.unmount();
    });
    mounted.container.remove();
  }
  probe = null;
  vi.clearAllMocks();
});

describe('useTotpEnrollment', () => {
  it('starts idle and resolves the QR secret on start()', async () => {
    await render(<Probe accountEmail={fakeUser.email} />);

    expect(probe?.step).toBe('idle');
    expect(probe?.otpauthUrl).toBeNull();

    let started!: Promise<void>;
    await act(async () => {
      started = probe!.start();
      await started;
    });

    expect(probe?.step).toBe('pending');
    expect(probe?.isPendingCode).toBe(true);
    expect(probe?.manualKey).toBe(fakeSecret.secretKey);
    expect(probe?.otpauthUrl).toContain(`otpauth://totp/Soberana:${fakeUser.email}`);
    expect(getSessionMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to the Firebase email when no account email is provided', async () => {
    await render(<Probe />);
    await act(async () => {
      await probe!.start();
    });
    expect(probe?.otpauthUrl).toContain(`Soberana:${fakeUser.email}`);
  });

  it('rejects short codes without touching Firebase', async () => {
    await render(<Probe accountEmail={fakeUser.email} />);
    await act(async () => {
      await probe!.start();
    });

    let result!: boolean;
    await act(async () => {
      result = await probe!.verify('123');
    });

    expect(result).toBe(false);
    expect(assertionForEnrollmentMock).not.toHaveBeenCalled();
    expect(probe?.step).toBe('pending');
  });

  it('enrolls on a valid code and reports success', async () => {
    const onEnrolled = vi.fn();
    await render(<Probe accountEmail={fakeUser.email} onEnrolled={onEnrolled} />);
    await act(async () => {
      await probe!.start();
    });

    let result!: boolean;
    await act(async () => {
      result = await probe!.verify('123456');
    });

    expect(result).toBe(true);
    expect(probe?.step).toBe('enrolled');
    expect(probe?.isEnrolled).toBe(true);
    expect(assertionForEnrollmentMock).toHaveBeenCalledWith(fakeSecret, '123456');
    expect(enrollMock).toHaveBeenCalledTimes(1);
    expect(onEnrolled).toHaveBeenCalledTimes(1);
    expect(probe?.otpauthUrl).toBeNull();
    expect(probe?.manualKey).toBeNull();
  });

  it('returns to pending with the error when the code is rejected', async () => {
    enrollMock.mockRejectedValueOnce(new Error('auth/invalid-verification-code'));
    await render(<Probe accountEmail={fakeUser.email} />);
    await act(async () => {
      await probe!.start();
    });

    let result!: boolean;
    await act(async () => {
      result = await probe!.verify('000000');
    });

    expect(result).toBe(false);
    expect(probe?.step).toBe('pending');
    expect(probe?.error).toBeInstanceOf(Error);
  });

  it('surfaces start failures and stays idle', async () => {
    generateSecretMock.mockRejectedValueOnce(new Error('auth/network-request-failed'));
    await render(<Probe accountEmail={fakeUser.email} />);

    await act(async () => {
      await probe!.start();
    });

    expect(probe?.step).toBe('idle');
    expect(probe?.error).toBeInstanceOf(Error);
    expect(probe?.otpauthUrl).toBeNull();
  });

  it('reset() drops the in-flight secret', async () => {
    await render(<Probe accountEmail={fakeUser.email} />);
    await act(async () => {
      await probe!.start();
    });

    await act(async () => {
      probe!.reset();
    });

    expect(probe?.step).toBe('idle');
    expect(probe?.otpauthUrl).toBeNull();
    expect(probe?.manualKey).toBeNull();
  });
});
