export const COMPANY_QUOTE_EMAIL = 'arealrmqtienda@gmail.com';
export const QUOTE_FROM = 'AREA LRMQ · Presupuestos <presupuestos@avisos.arealrmq.es>';

function plain(value, max = 5000) {
  return String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, '').slice(0, max);
}

const ATTRIBUTE_LABELS = {
  reference: 'Referencia del fabricante', measure: 'Medida', dimension: 'Dimensiones',
  finish: 'Acabado', finishCode: 'Código de acabado', distribution: 'Distribución',
  version: 'Versión', glass: 'Vidrio', opening: 'Apertura', orientation: 'Orientación',
  has_led: 'LED', lighting_type: 'Tipo de iluminación', lighting_technology: 'Tecnología de iluminación',
  light_temp: 'Temperatura de luz', shape: 'Forma', furniture_finish: 'Acabado del mueble',
  handle_finish: 'Acabado del tirador', countertop_finish: 'Acabado de encimera',
  presentation_type: 'Tipo de presentación', furniture_type: 'Tipo de mueble', module_type: 'Tipo de módulo',
  type: 'Tipo', configuration: 'Configuración', tap_type: 'Tipo de grifo', installation: 'Instalación',
  mechanism: 'Mecanismo', color: 'Color', texture: 'Textura', grille: 'Rejilla', valve: 'Válvula',
  finish_family: 'Familia de acabado', length_cm: 'Largo (cm)', width_cm: 'Ancho (cm)', offer: 'Oferta',
};

function receivedDate(value) {
  const date = new Date(value);
  if (!value || !Number.isFinite(date.getTime())) return 'No indicada';
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid', dateStyle: 'short', timeStyle: 'short',
  }).format(date) + ' (hora de Madrid)';
}

export function formatQuoteMail(job) {
  if (!job || !/^[A-Za-z0-9._:-]{1,128}$/.test(job.quoteId || '') || !Array.isArray(job.items) || !job.items.length || job.items.length > 50) throw new Error('INVALID_MAIL_JOB');
  const rows = [
    'NUEVA SOLICITUD DE PRESUPUESTO · AREA LRMQ',
    `Referencia de solicitud: ${job.quoteId}`,
    `Recibida: ${receivedDate(job.createdAt)}`,
    '', 'CONTACTO',
    `Nombre: ${plain(job.customerName, 200)}`,
    `Email: ${plain(job.email, 320) || 'No indicado'}`,
    `Teléfono: ${plain(job.phone, 80) || 'No indicado'}`,
    `Tipo de reforma: ${plain(job.renovationType, 120) || 'No indicado'}`,
    '', 'MENSAJE DEL CLIENTE', plain(job.message) || 'Sin mensaje adicional.',
    '', `ARTÍCULOS SOLICITADOS (${job.items.length})`,
  ];
  job.items.forEach((item, index) => {
    rows.push('', `${index + 1}. ${plain(item.productName, 300)}`, `Cantidad: ${plain(item.quantity, 10)}`);
    for (const [key, value] of Object.entries(item.attributes || {})) {
      if (!['string', 'number', 'boolean'].includes(typeof value) || value === '') continue;
      const label = ATTRIBUTE_LABELS[key] || plain(key, 40).replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
      const text = typeof value === 'boolean' ? (value ? 'Sí' : 'No') : plain(value, 300);
      rows.push(`  ${label}: ${text}`);
    }
    if (item.notes) rows.push(`Observaciones del artículo: ${plain(item.notes, 2000)}`);
  });
  if (job.sourcePage) rows.push('', `Página de origen: ${plain(job.sourcePage, 500)}`);
  return { sendTo: COMPANY_QUOTE_EMAIL, subject: `[AREA LRMQ] Solicitud de presupuesto · ${job.quoteId}`, message: rows.join('\n') };
}

export function resendRequest(job) {
  const mail = formatQuoteMail(job);
  const email = typeof job.email === 'string' ? job.email.trim() : '';
  const replyTo = email.length <= 320 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) && !/[\r\n\0]/.test(email) ? email : '';
  return {
    idempotencyKey: `quote-lrmq-v1/${job.quoteId}`,
    body: { from: QUOTE_FROM, to: [mail.sendTo], subject: mail.subject, text: mail.message,
      ...(replyTo ? { reply_to: replyTo } : {}),
    },
  };
}

export function classifyMailResult(result) {
  const code = Number(result?.statusCode);
  const body = result?.body;
  if (code >= 200 && code < 300 && typeof body?.id === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(body.id))
    return { state: 'sent', providerId: body.id, errorClass: '' };
  if (code === 429) return { state: 'retry', providerId: '', errorClass: 'provider_rate_limited' };
  if ([400, 401, 403, 404, 422].includes(code)) return { state: 'failed', providerId: '', errorClass: 'provider_rejected' };
  // No automatic retry after ambiguous acceptance, even with idempotency:
  // keys expire in 24h and the job could be recovered later.
  return { state: 'uncertain', providerId: '', errorClass: 'provider_result_uncertain' };
}
