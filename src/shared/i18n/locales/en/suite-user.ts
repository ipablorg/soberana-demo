import type { SuiteUserTranslations } from '../../types';

export const suiteUser: SuiteUserTranslations = {
  move: {
    collect: {
      title: 'Collect',
      subtitle: 'Generate payment links, QR codes or receive direct transfers',
      generateLink: 'Generate Payment Link',
      generateQR: 'Generate QR Code',
    },
    payout: {
      title: 'Pay',
      subtitle: 'Make bulk or individual payments to beneficiaries',
      newPayout: 'New Payment',
      selectBeneficiary: 'Select Beneficiary',
    },
    transfer: {
      title: 'Transfer',
      subtitle: 'Move funds between your accounts or to third parties',
      newTransfer: 'New Transfer',
      selectAccount: 'Select Account',
    },
  },
  change: {
    fx: {
      title: 'FX',
      subtitle: 'Currency conversion with the best market rates',
      lockRate: 'Lock Rate',
      bestRate: 'Best Rate Guaranteed',
    },
    bridge: {
      title: 'Bridge',
      subtitle: 'Convert between fiat and crypto without friction',
      onRamp: 'Buy Crypto',
      offRamp: 'Sell Crypto',
    },
  },
  account: {
    overview: {
      title: 'Account Overview',
      subtitle: 'View and manage all your balances',
      totalBalance: 'Total Balance',
      availableBalance: 'Available Balance',
    },
    cards: {
      title: 'Cards',
      subtitle: 'Manage your physical and virtual cards',
      issueCard: 'Issue Card',
      virtualCard: 'Virtual Card',
      physicalCard: 'Physical Card',
    },
  },
};

