/**
 * Bancos colombianos — códigos Bre-B / Superfinanciera (4 dígitos).
 *
 * Usado por el formulario de beneficiarios (`co_breb` en Bridge) para
 * que el usuario elija el banco por nombre y se envíe el código
 * correcto en `account.bank_code`. El doc de Bridge muestra
 * `bank_code: "1007"` como ejemplo (Bancolombia en este mismo esquema).
 */

export interface ColombiaBank {
  /** Bre-B / Superfinanciera 4-digit code sent to Bridge as `account.bank_code`. */
  code: string;
  /** Display name. */
  name: string;
}

export const COLOMBIA_BANKS: ColombiaBank[] = [
  { code: '1040', name: 'Banco Agrario' },
  { code: '1052', name: 'Banco AV Villas' },
  { code: '1032', name: 'Banco Caja Social' },
  { code: '1001', name: 'Banco de Bogotá' },
  { code: '1023', name: 'Banco de Occidente' },
  { code: '1062', name: 'Banco Falabella' },
  { code: '1014', name: 'Banco Itaú' },
  { code: '1060', name: 'Banco Pichincha' },
  { code: '1002', name: 'Banco Popular' },
  { code: '1053', name: 'Banco W' },
  { code: '1059', name: 'Bancamía' },
  { code: '1007', name: 'Bancolombia' },
  { code: '1061', name: 'Bancoomeva' },
  { code: '1013', name: 'BBVA Colombia' },
  { code: '1551', name: 'Daviplata' },
  { code: '1051', name: 'Davivienda' },
  { code: '1814', name: 'Global66' },
  { code: '1070', name: 'Lulo Bank' },
  { code: '1801', name: 'Movii' },
  { code: '1507', name: 'Nequi' },
  { code: '1809', name: 'Nu Colombia' },
  { code: '1560', name: 'Pibank' },
  { code: '1811', name: 'Rappipay' },
  { code: '1019', name: 'Scotiabank Colpatria' },
  { code: '1804', name: 'Ualá' },
];
