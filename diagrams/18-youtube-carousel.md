# YouTube Playlist Integration — Feature Flow

Documentation for **YouTube playlist integration** (Phase 4.1): auto-scrolling carousel on homepage.

## Diagram

```mermaid
%%{init: {'theme':'dark'}}%%
flowchart TD
  A[1. homepage] --> B[2. YoutubeCarousel client]
  B --> C[3. playlist config]
  C --> D[4. render videos]
  B --> E[5. auto-scroll interval]
  E --> F[6. pause on hover]
  F --> G[7. resume on leave]
```

## Key files

- `app/_components/YoutubeCarousel.tsx`
- `app/_components/YoutubeCarouselSkeleton.tsx`
- `app/page.tsx`

## Step-by-step actions

1. Homepage renders `YoutubeCarousel` (client component).
2. Playlist config (video IDs / playlist ID) provided in component (or config).
3. Renders video thumbnails in horizontal scroll container.
4. Auto-scrolls on interval (setInterval).
5. Pauses on hover (clearInterval).
6. Resumes on mouse leave.
7. Skeleton shown during loading (`YoutubeCarouselSkeleton`).

## Data flow

- Client-side only; no API calls; videos from YouTube CDN.

## Assumptions

- Playlist ID hardcoded in component (verify).

---

**Status**: Feature 18 of N.
