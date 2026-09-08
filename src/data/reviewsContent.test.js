import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { googleReviews } from './reviewsContent';

describe('googleReviews content', () => {
  it('holds the 13 owner-provided Google reviews, all five stars', () => {
    expect(googleReviews).toHaveLength(13);
    expect(new Set(googleReviews.map((review) => review.id)).size).toBe(13);
    googleReviews.forEach((review) => {
      expect(review.rating).toBe(5);
      expect(review.author).toBeTruthy();
      expect(review.date).toMatch(/^Hace/);
      expect(review.googleUrl).toContain('google.com/maps');
      expect(review.image.startsWith('/reviews/')).toBe(true);
      expect(existsSync(path.resolve('public', review.image.slice(1)))).toBe(true);
    });
  });

  it('keeps the review without a written comment empty instead of inventing text', () => {
    const withoutText = googleReviews.filter((review) => !review.text);
    expect(withoutText.map((review) => review.id)).toEqual(['laura-hernandez-parrado']);
  });
});
