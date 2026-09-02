import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { resetCatalogApiCacheForTests } from '../features/catalog/api/client';

afterEach(() => {
  cleanup();
  resetCatalogApiCacheForTests();
});
