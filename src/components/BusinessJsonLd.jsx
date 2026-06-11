import { PHONE_INTL, ADDRESS, INSTAGRAM_URL } from '../data/business';

export function BusinessJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'AREA LRMQ Tienda',
    image: 'https://arealrmq.es/logopng.png',
    url: 'https://arealrmq.es/',
    telephone: `+${PHONE_INTL}`,
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'C. de Aquitania, 69',
      addressLocality: 'Madrid',
      addressRegion: 'Madrid',
      postalCode: '28032',
      addressCountry: 'ES',
    },
    sameAs: [INSTAGRAM_URL],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
