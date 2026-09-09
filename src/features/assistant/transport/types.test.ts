import { describe, expect, it } from 'vitest';
import { parseChatResponse } from './types';

const response = {
  version: 1,
  conversationId: 'lrmq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  requestId: '7a4cb5c8-7b23-4f3d-9f65-16dba4c2b3e1',
  message: 'He encontrado un producto.',
  products: [{
    productId: 'mt-espejos-alba',
    slug: 'mt-espejos-alba',
    name: 'Alba',
    internalPath: '/productos/mt-espejos-alba',
    imageUrl: 'https://assets.colilladavid.es/proyectos/lrmq/catalogo/images/manillons_espejos/mt26-esp-alba-i01.webp',
    facts: ['Ø 60'],
    recommendationReason: 'Coincide con la medida solicitada.',
  }],
  actions: [],
};

describe('parseChatResponse product previews', () => {
  it('keeps a cover URL from the approved asset origin', () => {
    const parsed = parseChatResponse(response);

    expect(parsed.kind).toBe('success');
    if (parsed.kind !== 'success') return;
    expect(parsed.products[0].imageUrl).toBe(response.products[0].imageUrl);
  });

  it('drops an image from an unapproved origin without dropping the rest of the product', () => {
    const parsed = parseChatResponse({ ...response, products: [{ ...response.products[0], imageUrl: 'https://example.com/cover.webp' }] });

    expect(parsed.kind).toBe('success');
    if (parsed.kind !== 'success') return;
    expect(parsed.products).toHaveLength(0);
  });
});

describe('parseChatResponse actions', () => {
  it('keeps official contact actions with a known target', () => {
    const parsed = parseChatResponse({ ...response, actions: [{ type: 'contact_official', label: 'WhatsApp', target: 'whatsapp' }] });

    expect(parsed.kind).toBe('success');
    if (parsed.kind !== 'success') return;
    expect(parsed.actions).toEqual([{ type: 'contact_official', label: 'WhatsApp', target: 'whatsapp' }]);
  });

  it('drops actions whose target is not an approved official channel or internal path', () => {
    const parsed = parseChatResponse({
      ...response,
      actions: [
        { type: 'contact_official', label: 'Falso', target: 'https://evil.example' },
        { type: 'navigate_internal', label: 'Externo', target: 'https://evil.example/productos' },
      ],
    });

    expect(parsed.kind).toBe('success');
    if (parsed.kind !== 'success') return;
    expect(parsed.actions).toHaveLength(0);
  });
});
