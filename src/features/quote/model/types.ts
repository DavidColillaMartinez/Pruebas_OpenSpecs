export type QuoteRequestItem = {
  productId: string;
  variantId?: string;
  commercialOfferVariantId?: string;
  quantity: number;
  productName: string;
  variantSnapshot?: Record<string, unknown>;
  notes?: string;
};

export type QuoteRequestPayload = {
  customerName: string;
  phone?: string;
  email?: string;
  renovationType?: string;
  message?: string;
  sourcePage?: string;
  consentPrivacy: true;
  website?: string;
  items: QuoteRequestItem[];
};

export type QuoteRequestCreated = {
  id: string;
  status: string;
  created_at: string;
  item_count: number;
};

export type QuoteValidationError = {
  error: 'VALIDATION_ERROR';
  errors: Array<{ field: string; message: string }>;
};
