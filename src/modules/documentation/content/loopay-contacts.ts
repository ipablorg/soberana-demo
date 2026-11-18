/**
 * Loopay contacts for "Contactar a Loopay" CTA (Amazonas + Soberana)
 * WhatsApp links open direct chat. Numbers: Diego (+57), Carlos (+57), César (+593).
 */

export interface LoopayContact {
  name: string;
  /** E.164 without + (e.g. 573134585205) for wa.me */
  phoneE164: string;
  /** Full wa.me URL */
  whatsappUrl: string;
}

function buildWhatsAppUrl(phoneE164: string): string {
  return `https://wa.me/${phoneE164}`;
}

export const LOOPAY_CONTACTS_AMAZONAS: LoopayContact[] = [
  { name: 'Diego Alejandro Muñoz', phoneE164: '573134585205', whatsappUrl: buildWhatsAppUrl('573134585205') },
  { name: 'Carlos Ortegon', phoneE164: '573006119762', whatsappUrl: buildWhatsAppUrl('573006119762') },
  { name: 'César Espinosa', phoneE164: '593984446063', whatsappUrl: buildWhatsAppUrl('593984446063') },
];
