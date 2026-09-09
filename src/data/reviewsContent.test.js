import { describe, expect, it } from 'vitest';
import { googleReviews } from './reviewsContent';
import { LRMQ_ASSET_BASE_URL } from '../config/mediaAssets';

describe('googleReviews content', () => {
  it('holds the 13 owner-provided Google reviews, all five stars', () => {
    expect(googleReviews).toHaveLength(13);
    expect(new Set(googleReviews.map((review) => review.id)).size).toBe(13);
    googleReviews.forEach((review) => {
      expect(review.rating).toBe(5);
      expect(review.author).toBeTruthy();
      expect(review.date).toMatch(/^Hace/);
      expect(review.googleUrl).toContain('google.com/maps');
      expect(review.image.startsWith(`${LRMQ_ASSET_BASE_URL}/reviews/`)).toBe(true);
    });
  });

  it('keeps the review without a written comment empty instead of inventing text', () => {
    const withoutText = googleReviews.filter((review) => !review.text);
    expect(withoutText.map((review) => review.id)).toEqual(['laura-hernandez-parrado']);
  });
});
