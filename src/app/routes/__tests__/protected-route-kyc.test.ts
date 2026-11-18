import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const PROTECTED_ROUTE_PATH = join(__dirname, '..', 'protected-route.tsx');
const SUITE_USER_ROUTES_PATH = join(__dirname, '..', 'suite-user-routes.tsx');
const protectedRouteSource = readFileSync(PROTECTED_ROUTE_PATH, 'utf-8');
const suiteUserRoutesSource = readFileSync(SUITE_USER_ROUTES_PATH, 'utf-8');

describe('ProtectedRoute — KYC behavior', () => {
  const sourceCode = protectedRouteSource;

  it('does NOT import KYCVerificationModal', () => {
    expect(sourceCode).not.toContain('KYCVerificationModal');
  });

  it('does NOT render a blocking modal for KYC', () => {
    expect(sourceCode).not.toContain('showKYCModal');
    expect(sourceCode).not.toContain('pointer-events-none');
    expect(sourceCode).not.toContain('opacity-50');
  });

  it('does NOT dim page content based on KYC status', () => {
    expect(sourceCode).not.toMatch(/className=.*canTransact.*opacity/);
    expect(sourceCode).not.toMatch(/className=.*showKYC.*opacity/);
  });

  it('renders children directly without KYC wrapper', () => {
    expect(sourceCode).toContain('children');
    expect(sourceCode).not.toContain('<Dialog');
  });
});

describe('KYCVerificationModal — deleted', () => {
  it('the modal file no longer exists', () => {
    expect(() => {
      readFileSync(
        join(__dirname, '..', '..', '..', 'shared', 'components', 'common', 'KYCVerificationModal.tsx'),
        'utf-8'
      );
    }).toThrow();
  });
});

describe('ConversationalHome — shows KYC banner', () => {
  const homePath = join(
    __dirname, '..', '..', '..', 'modules', 'suite-user', 'features',
    'dashboard', 'pages', 'conversational-home.tsx'
  );
  const homeSource = readFileSync(homePath, 'utf-8');

  it('imports KYCBanner component', () => {
    expect(homeSource).toContain('KYCBanner');
  });

  it('renders <KYCBanner /> in the page', () => {
    expect(homeSource).toMatch(/<KYCBanner\s*\/?>/);
  });

  it('does not mount LoopayX quote surfaces in the active dashboard seam', () => {
    expect(homeSource).not.toMatch(/<LoopayXPairChips\b/);
    expect(homeSource).not.toMatch(/<LoopayXQuoteForm\b/);
    expect(homeSource).not.toMatch(/<LoopayXSharePanel\b/);
  });

  it('keeps the dashboard dynamic island in the soberana composition path', () => {
    expect(homeSource).toContain('<DynamicIsland');
    expect(homeSource).not.toContain("mode={loopayXActive ? 'loopayx' : 'soberana'}");
    expect(homeSource).not.toContain('loopayxNarration=');
    expect(homeSource).not.toContain('onShare={loopayXActive ? () => setShareOpen(true) : undefined}');
  });
});

describe('ProtectedRoute — suite onboarding gate', () => {
  it('wraps suite content in the SuiteOnboardingGuard when requested', () => {
    expect(protectedRouteSource).toContain('SuiteOnboardingGuard');
    expect(protectedRouteSource).toContain('enforceOnboardingGate');
  });

  it('redirects gated suite users to verify-identity', () => {
    expect(protectedRouteSource).toContain('SUITE_ONBOARDING_REDIRECT_PATH');
    expect(protectedRouteSource).toContain('shouldGateSuiteOnboarding');
  });

  it('marks onboarding routes to skip redirect loops', () => {
    expect(suiteUserRoutesSource).toContain('path="bridge-kyc-start"');
    expect(suiteUserRoutesSource).toContain('path="verify-identity"');
    expect(suiteUserRoutesSource).toContain('skipOnboardingGate');
  });

  it('keeps verify-identity as the only real KYC route', () => {
    const bridgePagePath = join(
      __dirname,
      '..',
      '..',
      '..',
      'modules',
      'suite-user',
      'features',
      'bridge-kyc',
      'pages',
      'bridge-kyc-page.tsx'
    );
    const bridgePageSource = readFileSync(bridgePagePath, 'utf-8');

    expect(bridgePageSource).toContain("navigate('/suite/verify-identity', { replace: true });");
  });
});

describe('SuiteOnboardingGuard — readiness inputs', () => {
  const useKycSource = readFileSync(
    join(__dirname, '..', '..', '..', 'shared', 'hooks', 'useKYC.ts'),
    'utf-8',
  );

  it('derives isReadyForSuite from KYC, raw customer status and wallet existence', () => {
    expect(useKycSource).toContain('computeIsReadyForSuite({');
    expect(useKycSource).toContain('customerStatus: profileCustomerStatus');
    expect(useKycSource).toContain('walletExists: hasWallet');
  });

  it('keeps the guard loading while the profile or wallets are still resolving', () => {
    expect(useKycSource).toContain('isCustomerProfileLoading');
    expect(useKycSource).toContain('isWalletsLoading ||');
    expect(protectedRouteSource).toContain('<LoadingScreen />');
  });
});
