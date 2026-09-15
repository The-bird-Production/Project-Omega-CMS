'use client';
import dynamic from 'next/dynamic';

// A Server Component can't use `dynamic(..., { ssr: false })` directly
// (Next.js disallows it there) — this thin client wrapper exists so the
// actual `ssr: false` import can live in a place that's allowed to have
// it, which is what makes BlockNote/Mantine's client bundle load only for
// a page/article that actually needs it (see BlockContent.jsx / render.js)
// instead of shipping on every page.
const BlockContentClient = dynamic(() => import('./BlockContentClient'), { ssr: false });

export default function BlockContentBranch({ Wrapper, className, blocks }) {
  return (
    <Wrapper className={className}>
      <BlockContentClient blocks={blocks} />
    </Wrapper>
  );
}
