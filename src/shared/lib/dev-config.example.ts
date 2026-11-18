/**
 * ⚠️ EXAMPLE FILE - DO NOT USE IN PRODUCTION
 * 
 * This file shows examples of how to configure dev mode.
 * Real configuration is in dev-config.ts
 */

// ============================================
// EXAMPLE 1: Enable Mock Mode for UI Development
// ============================================

/*
// In dev-config.ts, line 23:
const FORCE_MOCK_MODE = true; // ← Enable mock mode

Result:
- Skip login screen
- Land directly on /suite/dashboard
- Mock user authenticated automatically
- All queries return mock data
*/

// ============================================
// EXAMPLE 2: Disable Mock Mode (Use Real Backend)
// ============================================

/*
// In dev-config.ts, line 23:
const FORCE_MOCK_MODE = false; // ← Disable mock mode

Result:
- Normal login flow
- Real GraphQL queries
- Backend connection required
- Real authentication
*/

// ============================================
// EXAMPLE 3: Change Mock User Role
// ============================================

/*
// Method A: Environment Variable
// In .env.local:
VITE_DEV_MOCK_USER_ROLE=staff_admin

// Method B: Modify getDevMockUserRole() in dev-config.ts
export const getDevMockUserRole = () => {
  return 'staff_admin'; // ← Options: 'company_admin' | 'staff_admin' | 'company_user'
};

Result:
- Mock user has staff permissions
- Access to backoffice features
- All companies visible
*/

// ============================================
// EXAMPLE 4: Custom Mock Data for Specific Page
// ============================================

/*
// In your component or hook:
import { useMockableQuery } from '@/shared/hooks/use-mock-graphql';
import { mockAccounts } from '@/shared/lib/mock-data';

function useBalances() {
  return useMockableQuery(
    ['balances'],
    GetBalancesDocument,
    undefined,
    {
      mockData: mockAccounts, // Returns this when FORCE_MOCK_MODE = true
      mockDelay: 500,         // Simulates 500ms network delay
    }
  );
}

Result:
- Real query when mock mode disabled
- Mock data when mock mode enabled
- Realistic loading states
*/

// ============================================
// EXAMPLE 5: Test Inactive Company State
// ============================================

/*
// In mock-data.ts, modify mockAuthUser:
export const mockAuthUser = {
  // ...
  company_user: [{
    company: {
      id: 'company-demo-123',
      name: 'Loopay Demo Corp',
      stateCompany: 'pending',        // ← Change to 'pending'
      stateStudyCompany: 'in_review', // ← Change to 'in_review'
      // ...
    }
  }]
};

Result:
- Dashboard shows "Account not active" banner
- Buttons disabled
- Can test inactive state UI
*/

// ============================================
// EXAMPLE 6: Test KYC Pending State
// ============================================

/*
// In modules/suite-user/features/account/hooks/useBridgeKYC.ts:
const [mockData] = useState<BridgeKYCData>({
  kycStatus: 'PENDING',   // ← Change from 'APPROVED'
  canTransact: false,     // ← Change from true
  kycLink: 'https://kyc.loopay.com/verify/mock',
  // ...
});

Result:
- User redirected to KYC verification page
- KYC banner shown on dashboard
- Transactions disabled
*/

// ============================================
// EXAMPLE 7: Conditional Mock Mode Based on Feature Flag
// ============================================

/*
// In dev-config.ts:
export const isDevMockMode = (): boolean => {
  // Enable mock only for specific features
  const features = {
    dashboard: true,   // ← Mock data for dashboard
    move: true,        // ← Mock data for payments
    change: false,     // ← Use real backend for conversions
  };
  
  const currentPath = window.location.pathname;
  
  if (currentPath.includes('/convert')) {
    return features.change && isDev();
  }
  
  return isDev() && FORCE_MOCK_MODE;
};

Result:
- Dashboard and Move use mock data
- Change/Convert uses real backend
- Hybrid development mode
*/

// ============================================
// EXAMPLE 8: Debug Mock Mode in Console
// ============================================

/*
// In browser console:
localStorage.setItem('debug-mock-mode', 'true');
location.reload();

// This enables extra logging for mock data
// See what queries are being mocked
// See what data is being returned

// To disable:
localStorage.removeItem('debug-mock-mode');
location.reload();
*/

export {};
