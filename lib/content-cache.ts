import { unstable_cache } from "next/cache";

export type ContentCacheConfig = {
  tag: string;
  version: number;
  ttl: number;
};

/**
 * Cross-request cache for static seed-content queries.
 *
 * Invalidation: bump `version` after re-running a seed script — seeds run
 * outside the Next.js runtime, so revalidateTag() is unusable there. The tag
 * is reserved for a future admin revalidate endpoint.
 *
 * NOTE: cached values are shared references across requests — callers must
 * treat results as read-only (or copy at the boundary).
 */
export function createContentCache({ tag, version, ttl }: ContentCacheConfig) {
  return function withContentCache<T>(
    key: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    return unstable_cache(fn, [key, String(version)], {
      tags: [tag],
      revalidate: ttl,
    })();
  };
}
