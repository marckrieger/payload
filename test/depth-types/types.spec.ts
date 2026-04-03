import type { ApplyDepth, ApplyDepthToResult, PaginatedDocs } from 'payload'

import payload from 'payload'
import { describe, expect, test } from 'tstyche'

import type { Category, Media, Post, Setting, Tag } from './payload-types.js'

// ─── Helpers: expected types at specific depths ─────────────────────────────

/** Category at depth 0 = just the numeric ID */
type CategoryID = number
type PostID = number
type MediaID = number
type TagID = number

/** Category with all nested rels resolved to IDs (depth exhausted) */
type CategoryAtLeaf = {
  createdAt: string
  featuredPost?: null | PostID
  id: number
  name: string
  relatedPosts?: {
    docs?: PostID[]
    hasNextPage?: boolean
    totalDocs?: number
  }
  updatedAt: string
}

/** Media with all nested rels resolved to IDs (depth exhausted) */
type MediaAtLeaf = {
  alt?: null | string
  createdAt: string
  filename?: null | string
  filesize?: null | number
  focalX?: null | number
  focalY?: null | number
  height?: null | number
  id: number
  mimeType?: null | string
  thumbnailURL?: null | string
  updatedAt: string
  url?: null | string
  width?: null | number
}

/** Post with nested rels as IDs */
type PostAtLeaf = {
  categories?: CategoryID[] | null
  category?: CategoryID | null
  createdAt: string
  id: number
  image?: MediaID | null
  meta?: {
    nestedRelation?: CategoryID | null
  }
  polymorphic?:
    | ({
        relationTo: 'categories'
        value: CategoryID
      } | null)
    | {
        relationTo: 'tags'
        value: TagID
      }
  title: string
  updatedAt: string
}

/** Post at depth 1: relationships populated one level, nested become IDs */
type PostAtDepth1 = {
  categories?: CategoryAtLeaf[] | null
  category?: CategoryAtLeaf | null
  createdAt: string
  id: number
  image?: MediaAtLeaf | null
  meta?: {
    nestedRelation?: CategoryAtLeaf | null
  }
  polymorphic?:
    | ({
        relationTo: 'categories'
        value: CategoryAtLeaf
      } | null)
    | {
        relationTo: 'tags'
        value: {
          createdAt: string
          id: number
          label: string
          updatedAt: string
        }
      }
  title: string
  updatedAt: string
}

describe('Depth-aware type safety', () => {
  // ─── depth: 0 → all relationships resolve to numeric IDs ─────────────────

  test('payload.findByID with depth: 0 returns IDs for relationships', () => {
    expect(payload.findByID({ id: 1, collection: 'posts', depth: 0 })).type.toBe<
      Promise<PostAtLeaf>
    >()
  })

  test('payload.find with depth: 0 returns IDs for relationships', () => {
    expect(payload.find({ collection: 'posts', depth: 0 })).type.toBe<
      Promise<PaginatedDocs<PostAtLeaf>>
    >()
  })

  // ─── depth: 1 → relationships populated, nested relationships become IDs ──

  test('payload.findByID with depth: 1 returns populated relationships', () => {
    expect(payload.findByID({ id: 1, collection: 'posts', depth: 1 })).type.toBe<
      Promise<PostAtDepth1>
    >()
  })

  // ─── Upload field at depth 0 → numeric ID, not number | Media ────────────

  test('upload field at depth 0 is numeric ID', () => {
    const result = payload.findByID({ id: 1, collection: 'posts', depth: 0 })
    type Result = Awaited<typeof result>
    const post = {} as Result
    expect(post.image).type.toBe<null | number | undefined>()
  })

  test('upload field at depth 1 is populated Media object', () => {
    const result = payload.findByID({ id: 1, collection: 'posts', depth: 1 })
    type Result = Awaited<typeof result>
    const post = {} as Result
    expect(post.image).type.toBe<MediaAtLeaf | null | undefined>()
  })

  // ─── No depth specified → uses DefaultDepth (2 when typeSafeDepth enabled)

  test('payload.findByID without depth uses default depth (2)', () => {
    const withDefault = payload.findByID({ id: 1, collection: 'posts' })
    const withExplicit = payload.findByID({ id: 1, collection: 'posts', depth: 2 })
    expect(withDefault).type.toBe<typeof withExplicit>()
  })

  // ─── Globals with depth ───────────────────────────────────────────────────

  test('payload.findGlobal with depth: 0 returns IDs', () => {
    expect(payload.findGlobal({ slug: 'settings', depth: 0 })).type.toBe<
      Promise<{
        createdAt?: null | string
        featuredPost?: null | PostID
        id: number
        siteName?: null | string
        updatedAt?: null | string
      }>
    >()
  })

  test('payload.findGlobal with depth: 1 returns populated relationships', () => {
    expect(payload.findGlobal({ slug: 'settings', depth: 1 })).type.toBe<
      Promise<{
        createdAt?: null | string
        featuredPost?: null | PostAtLeaf
        id: number
        siteName?: null | string
        updatedAt?: null | string
      }>
    >()
  })

  // ─── disableErrors + depth ────────────────────────────────────────────────

  test('payload.findByID with disableErrors and depth: 0', () => {
    expect(
      payload.findByID({ id: 1, collection: 'posts', disableErrors: true, depth: 0 }),
    ).type.toBe<Promise<null | PostAtLeaf>>()
  })

  // ─── create, update, delete all support depth ────────────────────────────

  test('payload.create with depth: 0 returns IDs', () => {
    expect(payload.create({ collection: 'tags', data: { label: 'test' }, depth: 0 })).type.toBe<
      Promise<{
        createdAt: string
        id: number
        label: string
        updatedAt: string
      }>
    >()
  })

  // ─── ApplyDepth utility type tests ────────────────────────────────────────

  test('ApplyDepth with number (non-literal) passes through unchanged', () => {
    type Result = ApplyDepth<Post, number>
    expect<Result>().type.toBe<Post>()
  })

  test('ApplyDepth<Post, 0> resolves branded Post to its ID type', () => {
    type Result = ApplyDepth<Post, 0>
    expect<Result>().type.toBe<number>()
  })

  test('ApplyDepthToResult<Post, 0> keeps object shape but resolves nested to IDs', () => {
    type Result = ApplyDepthToResult<Post, 0>
    const result = {} as Result
    expect(result.category).type.toBe<null | number | undefined>()
    expect(result.image).type.toBe<null | number | undefined>()
    expect(result.title).type.toBe<string>()
    expect(result.id).type.toBe<number>()
  })

  test('ApplyDepthToResult<Post, 1> populates one level', () => {
    type Result = ApplyDepthToResult<Post, 1>
    const result = {} as Result
    // category is populated but its nested relationships become IDs
    expect(result.category).type.toBe<CategoryAtLeaf | null | undefined>()
    expect(result.image).type.toBe<MediaAtLeaf | null | undefined>()
  })
})
