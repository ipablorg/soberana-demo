import type { SuiteUserTranslations } from '../../types';

export const suiteUser: SuiteUserTranslations = {
  move: {
    collect: {
      title: 'Cobrar',
      subtitle: 'Genera links de pago, QR codes o recibe transferencias directas',
      generateLink: 'Generar Link de Pago',
      generateQR: 'Generar Código QR',
    },
    payout: {
      title: 'Pagar',
      subtitle: 'Realiza pagos masivos o individuales a beneficiarios',
      newPayout: 'Nuevo Pago',
      selectBeneficiary: 'Seleccionar Beneficiario',
    },
    transfer: {
      title: 'Transferir',
      subtitle: 'Mueve fondos entre tus cuentas o a terceros',
      newTransfer: 'Nueva Transferencia',
      selectAccount: 'Seleccionar Cuenta',
    },
  },
  change: {
    fx: {
      title: 'FX',
      subtitle: 'Conversión de divisas con las mejores tasas del mercado',
      lockRate: 'Bloquear Tasa',
      bestRate: 'Mejor Tasa Garantizada',
    },
    bridge: {
      title: 'Bridge',
      subtitle: 'Convierte entre fiat y crypto sin fricciones',
      onRamp: 'Comprar Crypto',
      offRamp: 'Vender Crypto',
    },
  },
  account: {
    overview: {
      title: 'Resumen de Cuentas',
      subtitle: 'Visualiza y gestiona todos tus balances',
      totalBalance: 'Balance Total',
      availableBalance: 'Balance Disponible',
    },
    cards: {
      title: 'Tarjetas',
      subtitle: 'Gestiona tus tarjetas físicas y virtuales',
      issueCard: 'Emitir Tarjeta',
      virtualCard: 'Tarjeta Virtual',
      physicalCard: 'Tarjeta Física',
    },
  },
};

