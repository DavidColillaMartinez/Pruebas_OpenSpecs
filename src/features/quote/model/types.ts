export type QuoteRequestItem = {
  productId: string;
  variantId?: string;
  commercialOfferVariantId?: string;
  reference?: string;
  quantity: number;
  productName: string;
  selectedAttributes?: Record<string, string | number | boolean>;
  variantSnapshot?: Record<string, string | number | boolean | undefined>;
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
