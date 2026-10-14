import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';

export const QUOTE_AUTH_HEADER = 'x-lrmq-quote-auth';
export const QUOTE_FINGERPRINT_HEADER = 'x-lrmq-quote-fingerprint';
export const QUOTE_CLIENT_HEADER = 'x-lrmq-quote-client';
const bursts = new Map();
const BURST_WINDOW_MS = 60000;
const BURST_LIMIT = 6;
const MAX_BUCKETS = 2048;

function header(request, name) {
  const value = request.headers?.[name];
  return typeof value === 'string' ? value : '';
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function digest(secret, purpose, value) {
  return `v1:${createHmac('sha256', secret).update(`${purpose}\n${value}`).digest('hex')}`;
}

// This fast local burst guard is additive. The authoritative, cross-instance
// rate limit is enforced transactionally in PostgreSQL by the authenticated flow.
function admitBurst(key, now) {
  for (const [client, bucket] of bursts) {
    if (bucket.until <= now) bursts.delete(client);
  }
  const current = bursts.get(key);
  if (current && current.count >= BURST_LIMIT) return false;
  if (!current && bursts.size >= MAX_BUCKETS) {
    const oldest = bursts.keys().next().value;
    if (oldest !== undefined) bursts.delete(oldest);
  }
  bursts.set(key, current ? { ...current, count: current.count + 1 } : { count: 1, until: now + BURST_WINDOW_MS });
  return true;
}

export function resetQuoteBurstGuard() { bursts.clear(); }

export function prepareQuoteIngress(request, body, env = process.env, now = Date.now()) {
  if (env.N8N_QUOTE_DELIVERY_ENABLED !== 'true') return { headers: {} };
  const secret = env.N8N_QUOTE_WEBHOOK_SECRET;
  const allowed = (env.QUOTE_ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
  if (typeof secret !== 'string' || secret.length < 32 || /[\r\n\0]/.test(secret) || !allowed.length) {
    return { status: 503, error: 'QUOTE_DELIVERY_NOT_CONFIGURED' };
  }
  const origin = header(request, 'origin');
  let normalized;
  try { normalized = new URL(origin).origin; } catch { return { status: 403, error: 'QUOTE_ORIGIN_NOT_ALLOWED' }; }
  if (origin !== normalized || !allowed.includes(normalized)) return { status: 403, error: 'QUOTE_ORIGIN_NOT_ALLOWED' };
  const site = header(request, 'sec-fetch-site');
  if (site && !['same-origin', 'same-site'].includes(site)) return { status: 403, error: 'QUOTE_ORIGIN_NOT_ALLOWED' };
  // Never use a client-provided forwarded-for chain. Vercel overwrites its
  // platform header; local development uses the socket peer instead.
  const address = env.VERCEL === '1' ? header(request, 'x-vercel-forwarded-for').split(',')[0].trim() : request.socket?.remoteAddress;
  if (!isIP(address || '')) return { status: 503, error: 'QUOTE_CLIENT_UNAVAILABLE' };
  const client = digest(secret, 'client', address);
  if (!admitBurst(client, now)) return { status: 429, error: 'RATE_LIMITED' };
  const normalizedBody = { ...body, customerName: body.customerName.trim() };
  if (typeof body.email === 'string') normalizedBody.email = body.email.trim().toLowerCase();
  if (typeof body.phone === 'string') normalizedBody.phone = body.phone.trim();
  return { headers: {
    [QUOTE_AUTH_HEADER]: secret,
    [QUOTE_CLIENT_HEADER]: client,
    [QUOTE_FINGERPRINT_HEADER]: digest(secret, 'payload', canonical(normalizedBody)),
  } };
}
