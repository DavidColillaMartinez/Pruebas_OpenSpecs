import { PHONE_INTL, INSTAGRAM_URL, GOOGLE_BUSINESS_PROFILE_URL } from '../data/business';
import { LRMQ_ASSETS } from '../config/mediaAssets';
import { LEGAL_BUSINESS } from '../features/legal/business';

export function BusinessJsonLd() {
  // Solo datos confirmados por el aviso legal o el perfil público. Sin priceRange,
  // horarios, coordenadas ni valoraciones: no están acreditados para este negocio.
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: LEGAL_BUSINESS.brand,
    legalName: LEGAL_BUSINESS.company,
    image: LRMQ_ASSETS.logo,
    url: 'https://arealrmq.es/',
    telephone: `+${PHONE_INTL}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'C/ Aquitania, 69, local 1',
      addressLocality: 'Madrid',
      addressRegion: 'Madrid',
      postalCode: '28032',
      addressCountry: 'ES',
    },
    sameAs: [INSTAGRAM_URL, GOOGLE_BUSINESS_PROFILE_URL],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
