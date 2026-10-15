import { PHONE, PHONE_INTL, INSTAGRAM_URL, MAPS_URL } from '../../../data/business';

export const ASSISTANT_OFFICIAL_TARGETS = new Set<string>(['whatsapp', 'phone', 'instagram', 'map']);

export function makeOfficialContactHref(target: string): string | null {
  switch (target) {
    case 'whatsapp':
      return makeWhatsAppHref();
    case 'phone':
      return `tel:+34${PHONE}`;
    case 'instagram':
      return INSTAGRAM_URL;
    case 'map':
      return MAPS_URL;
    default:
      return null;
  }
}

export function makeWhatsAppHref(message?: string): string {
  const base = `https://wa.me/${PHONE_INTL}`;
  if (!message) return base;
  // URLSearchParams encodes accents, `&`, `+` and newlines; the recipient
  // always stays the official number built from the business data.
  return `${base}?${new URLSearchParams({ text: message }).toString()}`;
}

export function officialContactLabel(target: string): string | null {
  switch (target) {
    case 'whatsapp':
      return `WhatsApp ${PHONE}`;
    case 'phone':
      return 'Llamar';
    case 'instagram':
      return 'Instagram';
    case 'map':
      return 'Encuéntranos';
    default:
      return null;
  }
}
