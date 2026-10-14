export const LEGAL_BUSINESS = {
  brand: 'AREA LRMQ',
  company: 'ÁREA LRMQ DESING S.L',
  taxId: 'B19932607',
  address: 'C/ Aquitania, 69, local 1, 28032 Madrid, España',
  email: 'arealrmqtienda@gmail.com',
  phone: '+34 692 91 21 80',
  origin: 'https://arealrmq.es',
} as const;

export const LEGAL_ROUTES = [
  { path: '/aviso-legal', title: 'Aviso legal' },
  { path: '/privacidad', title: 'Política de privacidad' },
  { path: '/cookies', title: 'Cookies y almacenamiento' },
] as const;

export const PRIVACY_READ_LABEL = 'He leído la información sobre protección de datos';
export const PRIVACY_READ_ERROR = 'Confirma que has leído la información sobre protección de datos.';

export const PRIVACY_SUMMARIES = {
  quote: `Responsable: ${LEGAL_BUSINESS.company}. Usamos tu contacto, mensaje y selección para atender tu presupuesto gratuito y su seguimiento, como medidas precontractuales. La empresa responderá mediante los datos de contacto que facilites. Puedes ejercer tus derechos en ${LEGAL_BUSINESS.email}. No usamos estos contactos para promociones.`,
  whatsapp: `Responsable: ${LEGAL_BUSINESS.company}. Atendemos tu consulta o presupuesto; medidas precontractuales para tu proyecto e interés legítimo para consultas generales. Al abrir WhatsApp, el texto preparado se transmite a ese servicio; tú decides enviarlo a la empresa. Derechos: ${LEGAL_BUSINESS.email}.`,
  assistant: `${LEGAL_BUSINESS.company} usa tu mensaje y el contexto de navegación para orientarte mediante inteligencia artificial. Interés legítimo: atender consultas. Las respuestas son orientativas. Evita datos sensibles. Derechos: ${LEGAL_BUSINESS.email}.`,
} as const;
