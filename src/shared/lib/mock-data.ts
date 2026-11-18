import type {
  Organization,
  LegalEntity,
  Account,
  Counterparty,
  Transaction,
  Case,
  Card,
  Order,
  Quote,
  PaymentLink,
  User,
} from '@/shared/types';

export const mockOrganizations: Organization[] = [
  { id: 'org1', name: 'Loopay Demo Corp' },
  { id: 'org2', name: 'Loopay Holdings' },
];

export const mockEntities: LegalEntity[] = [
  { id: 'ent1', orgId: 'org1', name: 'Loopay México SA', country: 'MX' },
  { id: 'ent2', orgId: 'org1', name: 'Loopay Brasil Ltda', country: 'BR' },
];

export const mockAccounts: Account[] = [
  {
    id: 'acc1',
    entityId: 'ent1',
    name: 'Cuenta USD Principal',
    type: 'bank',
    currency: 'USD',
    balance: 245789.5,
  },
  {
    id: 'acc2',
    entityId: 'ent1',
    name: 'Cuenta MXN Operaciones',
    type: 'bank',
    currency: 'MXN',
    balance: 1850000,
  },
  {
    id: 'acc3',
    entityId: 'ent2',
    name: 'Conta BRL Principal',
    type: 'bank',
    currency: 'BRL',
    balance: 890000,
  },
  {
    id: 'acc4',
    entityId: 'ent1',
    name: 'Wallet USDC (Base)',
    type: 'wallet',
    asset: 'USDC',
    network: 'BASE',
    balance: 125000,
  },
  {
    id: 'acc5',
    entityId: 'ent1',
    name: 'Wallet USDT (ETH)',
    type: 'wallet',
    asset: 'USDT',
    network: 'ETH',
    balance: 78500,
  },
  {
    id: 'acc6',
    entityId: 'ent1',
    name: 'Cuenta EUR Tesorería',
    type: 'bank',
    currency: 'EUR',
    balance: 185000,
  },
];

export const mockCounterparties: Counterparty[] = [
  {
    id: 'cp1',
    type: 'beneficiary',
    name: 'Proveedor Tech Solutions',
    accountRef: 'IBAN ES1234567890',
    email: 'finanzas@techsol.com',
  },
  {
    id: 'cp2',
    type: 'beneficiary',
    name: 'Servicios Consultoría Mx',
    accountRef: 'CLABE 012180001234567890',
    email: 'pagos@consultoria.mx',
  },
  {
    id: 'cp3',
    type: 'merchant',
    name: 'Tienda Online Demo',
    email: 'checkout@tienda.com',
  },
  {
    id: 'cp4',
    type: 'wallet',
    name: 'Treasury Wallet Main',
    network: 'BASE',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8',
  },
  {
    id: 'cp5',
    type: 'client',
    name: 'Cliente Corporativo ABC',
    email: 'tesoreria@abc.com',
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    orderId: 'ord1',
    asset: 'USD',
    amount: 15000,
    status: 'settled',
    ts: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'tx2',
    orderId: 'ord2',
    asset: 'USDC',
    amount: 25000,
    status: 'settled',
    ts: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'tx3',
    orderId: 'ord3',
    asset: 'MXN',
    amount: 180000,
    status: 'authorized',
    ts: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'tx4',
    orderId: 'ord4',
    asset: 'EUR',
    amount: 8500,
    status: 'initiated',
    ts: new Date(Date.now() - 900000).toISOString(),
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ord1',
    kind: 'payout',
    status: 'settled',
    amount: 15000,
    fromAccount: 'acc1',
    counterpartyId: 'cp1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    settledAt: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: 'ord2',
    kind: 'conversion',
    status: 'settled',
    amount: 25000,
    fromAccount: 'acc1',
    toAccount: 'acc4',
    quoteId: 'qt1',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    settledAt: new Date(Date.now() - 6800000).toISOString(),
  },
  {
    id: 'ord3',
    kind: 'payout',
    status: 'processing',
    amount: 180000,
    fromAccount: 'acc2',
    counterpartyId: 'cp2',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'ord4',
    kind: 'payout',
    status: 'requires_approval',
    amount: 8500,
    fromAccount: 'acc6',
    counterpartyId: 'cp1',
    requiresApproval: true,
    requiredApprovals: 2,
    approvedBy: ['user1'],
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
];

export const mockCases: Case[] = [
  {
    id: 'case1',
    reason: 'velocity',
    status: 'open',
    relatedOrderId: 'ord3',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'case2',
    reason: 'sanctions',
    status: 'review',
    assignedTo: 'user3',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'case3',
    reason: 'onchain_flag',
    status: 'open',
    relatedOrderId: 'ord2',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

export const mockCards: Card[] = [
  {
    id: 'card1',
    accountId: 'acc1',
    last4: '4532',
    status: 'active',
    limits: { daily: 10000 },
    tokenized: true,
  },
  {
    id: 'card2',
    accountId: 'acc2',
    last4: '8976',
    status: 'active',
    limits: { daily: 50000 },
    tokenized: false,
  },
  {
    id: 'card3',
    accountId: 'acc6',
    last4: '2341',
    status: 'blocked',
    limits: { daily: 5000 },
    tokenized: true,
  },
];

export const mockQuotes: Quote[] = [
  {
    id: 'qt1',
    kind: 'fx',
    fromAsset: 'USD',
    toAsset: 'EUR',
    amount: 10000,
    rate: 0.92,
    fee: 15,
    etaMins: 30,
    expiresAt: new Date(Date.now() + 600000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'qt2',
    kind: 'onoff',
    fromAsset: 'USD',
    toAsset: 'USDC',
    amount: 25000,
    rate: 0.998,
    fee: 50,
    etaMins: 15,
    expiresAt: new Date(Date.now() + 900000).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

export const mockPaymentLinks: PaymentLink[] = [
  {
    id: 'link1',
    amount: 500,
    currency: 'USD',
    status: 'paid',
    method: 'link',
    description: 'Pago Servicio Premium',
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    merchantRef: 'REF-001',
    url: 'https://pay.loopay.dev/link1',
  },
  {
    id: 'link2',
    amount: 1200,
    currency: 'MXN',
    status: 'pending',
    method: 'qr',
    description: 'Factura #4523',
    expiresAt: new Date(Date.now() + 172800000).toISOString(),
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    merchantRef: 'INV-4523',
  },
];

export const mockUsers: User[] = [
  { id: 'user1', email: 'pablo@loopay.dev', name: 'Pablo Ramirez', role: 'admin', avatar: '/src/shared/assets/pablo-avatar.png' },
  { id: 'user2', email: 'finanzas@loopay.dev', name: 'María Hernández', role: 'finance' },
  { id: 'user3', email: 'compliance@loopay.dev', name: 'Carlos Ruiz', role: 'compliance' },
  { id: 'user4', email: 'ops@loopay.dev', name: 'Ana López', role: 'ops' },
  { id: 'user5', email: 'dev@loopay.dev', name: 'Juan Pérez', role: 'developer' },
];

/**
 * Mock Authenticated User (for Development Mode)
 * 
 * This represents the currently authenticated user in mock mode.
 * Matches the AuthMe GraphQL response structure.
 */
export const mockAuthUser = {
  id: 'dev-user-123',
  auth_uid: 'firebase-dev-uid-456',
  email: 'dev@loopay.com',
  name: 'Developer Mode User',
  roles: ['COMPANY_USER', 'COMPANY_ADMIN'],
  staff_roles: [] as string[],
  company_roles: ['COMPANY_ADMIN'],
  company_user: [
    {
      id: 'company-user-1',
      company: {
        id: 'company-demo-123',
        name: 'Loopay Demo Corp',
        taxId: 'RFC123456ABC',
        country: 'MX',
        stateCompany: 'active',
        stateStudyCompany: 'approved',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-02-05T14:30:00.000Z',
      },
      role: 'admin',
      permissions: ['read', 'write', 'admin'],
    },
  ],
  has_accepted_latest_terms: true,
};

/**
 * Mock Staff User (for Staff/Backoffice Development)
 */
export const mockStaffUser = {
  id: 'dev-staff-789',
  auth_uid: 'firebase-staff-uid-101',
  email: 'staff@loopay.com',
  name: 'Staff Developer',
  roles: ['STAFF_USER', 'ALL_COMPANIES'],
  staff_roles: ['STAFF_ADMIN', 'STAFF_COMPLIANCE', 'STAFF_TREASURY'],
  company_roles: [] as string[],
  company_user: [] as never[],
  has_accepted_latest_terms: true,
};

/**
 * Get mock user based on role
 * 
 * @param role - User role ('company_admin' | 'staff_admin' | 'company_user')
 * @returns Mock user object matching GraphQL AuthUser type
 */
export const getMockUserByRole = (role: 'company_admin' | 'staff_admin' | 'company_user') => {
  if (role === 'staff_admin') {
    return mockStaffUser;
  }
  
  if (role === 'company_user') {
    return {
      ...mockAuthUser,
      roles: ['COMPANY_USER'],
      company_roles: ['COMPANY_USER'],
      company_user: [
        {
          ...mockAuthUser.company_user[0],
          role: 'user',
          permissions: ['read', 'write'],
        },
      ],
    };
  }
  
  // Default: company_admin
  return mockAuthUser;
};
