import { describe, expect, it } from 'vitest';
import { COMPANY_QUOTE_EMAIL, formatQuoteMail, classifyMailResult, resendRequest } from './format-mail.mjs';

describe('quote email template', () => {
  it('uses fixed headers and text content rather than interpolating HTML', () => {
    const mail = formatQuoteMail({ quoteId: 'quote-1', customerName: 'Ana', message: '<script>alert(1)</script>', items: [{ productName: 'Akord', quantity: 2, attributes: { finish: 'Cromo' } }] });
    expect(mail.sendTo).toBe(COMPANY_QUOTE_EMAIL);
    expect(mail.subject).toBe('[AREA LRMQ] Solicitud de presupuesto · quote-1');
    expect(mail.message).toContain('<script>alert(1)</script>');
    expect(mail.message).toContain('Cantidad: 2');
  });
  it('does not admit CRLF in the system-generated subject identifier', () => {
    expect(() => formatQuoteMail({ quoteId: 'x\r\nBcc:evil@example.test', items: [{}] })).toThrow('INVALID_MAIL_JOB');
  });
  it('includes renovation details and removes bidirectional/control spoofing characters', () => {
    const mail = formatQuoteMail({ quoteId: 'quote-2', renovationType: 'Reforma integral', customerName: 'Ana\u202e\u0000', items: [{ productName: 'Producto', quantity: 1 }] });
    expect(mail.message).toContain('Tipo de reforma: Reforma integral');
    expect(mail.message).toContain('Nombre: Ana\n');
    expect(mail.message).not.toMatch(/[\u202e\u0000]/);
  });
  it('builds stable Resend keys and server-owned routing', () => {
    const job = { quoteId: 'quote-1', from: 'evil@example.test', sendTo: 'evil@example.test', items: [{}] };
    const first = resendRequest(job);
    expect(first).toEqual(resendRequest(job));
    expect(first.idempotencyKey).toBe('quote-lrmq-v1/quote-1');
    expect(first.body.to).toEqual(['arealrmqtienda@gmail.com']);
    expect(first.body.from).toBe('AREA LRMQ · Presupuestos <presupuestos@avisos.arealrmq.es>');
    expect(first.body).not.toHaveProperty('html');
  });
  it('presents commercial labels and Madrid time and replies only to a safe contact', () => {
    const job = { quoteId: 'quote-3', email: 'ana@example.test', createdAt: '2026-10-13T20:37:16Z', items: [{ productName: 'Aktual', quantity: 1, attributes: { finish: 'Cromo', distribution: 'Angular al vértice', has_led: false } }] };
    const req = resendRequest(job);
    expect(req.body.reply_to).toBe('ana@example.test');
    expect(req.body.text).toContain('22:37 (hora de Madrid)');
    expect(req.body.text).toContain('Acabado: Cromo');
    expect(req.body.text).toContain('Distribución: Angular al vértice');
    expect(req.body.text).toContain('LED: No');
    expect(req.body.text).not.toContain('descargado enlaces');
    expect(resendRequest({ ...job, email: 'ana@example.test\r\nBcc: evil@example.test' }).body).not.toHaveProperty('reply_to');
    expect(resendRequest({ ...job, email: '' }).body).not.toHaveProperty('reply_to');
  });
  it.each([200, 201])('requires a successful HTTP acknowledgement and ID (%s)', (statusCode) => {
    expect(classifyMailResult({ statusCode, body: { id: 'resend123' } }).state).toBe('sent');
    expect(classifyMailResult({ statusCode, body: {} }).state).toBe('uncertain');
  });
  it.each([400, 401, 403, 404, 422])('records definitive rejection (%s)', (statusCode) => {
    expect(classifyMailResult({ statusCode, body: { id: 'misleading' } }).state).toBe('failed');
  });
  it('retries explicit rate limits but holds ambiguous responses', () => {
    expect(classifyMailResult({ statusCode: 429 }).state).toBe('retry');
    for (const result of [{ statusCode: 503 }, { statusCode: 409 }, { error: 'timeout' }, {}, { id: 'legacy-gmail' }])
      expect(classifyMailResult(result).state).toBe('uncertain');
  });
});
