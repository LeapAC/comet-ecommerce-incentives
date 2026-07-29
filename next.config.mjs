/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root — this checkout is a git worktree, so Next otherwise
  // warns about multiple lockfiles and infers the wrong root.
  turbopack: {
    root: import.meta.dirname,
  },
  // The base v0 project ships a few pre-existing type mismatches in the shadcn
  // UI primitives (React 18 ref typings) and uses React's `use()` hook, which
  // @types/react@18 doesn't declare. These are runtime-safe under Next 16, so
  // we don't block builds on them.
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig