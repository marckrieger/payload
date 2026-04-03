import type { ApplyDepth, PaginatedDocs } from 'payload'

import payload from 'payload'
import { describe, expect, test } from 'tstyche'

import type { Category, Post, Setting, Tag } from './payload-types.js'

// ─── Helper: stripped version of collection types (without __collection brand) ────
// ApplyDepth strips __collection when recursing into objects at depth > 0

type PostAtDepth1 = {
  categories?:
    | {
        createdAt: string
        featuredPost?: null | string
        id: string
        name: string
        relatedPosts?: {
          docs?: string[]
          hasNextPage?: boolean
          totalDocs?: number
        }
        updatedAt: string
      }[]
    | null
  category?: {
    createdAt: string
    featuredPost?: null | string
    id: string
    name: string
    relatedPosts?: {
      docs?: string[]
      hasNextPage?: boolean
      totalDocs?: number
    }
    updatedAt: string
  } | null
  createdAt: string
  id: string
  meta?: {
    nestedRelation?: {
      createdAt: string
      featuredPost?: null | string
      id: string
      name: string
      relatedPosts?: {
        docs?: string[]
        hasNextPage?: boolean
        totalDocs?: number
      }
      updatedAt: string
    } | null
  }
  polymorphic?:
    | ({
        relationTo: 'categories'
        value: {
          createdAt: string
          featuredPost?: null | string
          id: string
          name: string
          relatedPosts?: {
            docs?: string[]
            hasNextPage?: boolean
            totalDocs?: number
          }
          updatedAt: string
        }
      } | null)
    | {
        relationTo: 'tags'
        value: {
          createdAt: string
          id: string
          label: string
          updatedAt: string
        }
      }
  title: string
  updatedAt: string
}

describe('Depth-aware type safety', () => {
  // ─── depth: 0 → all relationships resolve to ID strings ─────────────────

  test('payload.findByID with depth: 0 returns IDs for relationships', () => {
    expect(payload.findByID({ id: '1', collection: 'posts', depth: 0 })).type.toBe<
      Promise<{
        categories?: null | string[]
        category?: null | string
        createdAt: string
        id: string
        meta?: {
          nestedRelation?: null | string
        }
        polymorphic?:
          | ({
              relationTo: 'categories'
              value: string
            } | null)
          | {
              relationTo: 'tags'
              value: string
            }
        title: string
        updatedAt: string
      }>
    >()
  })

  test('payload.find with depth: 0 returns IDs for relationships', () => {
    const result = payload.find({ collection: 'posts', depth: 0 })

    expect(result).type.toBe<
      Promise<
        PaginatedDocs<{
          categories?: null | string[]
          category?: null | string
          createdAt: string
          id: string
          meta?: {
            nestedRelation?: null | string
          }
          polymorphic?:
            | ({
                relationTo: 'categories'
                value: string
              } | null)
            | {
                relationTo: 'tags'
                value: string
              }
          title: string
          updatedAt: string
        }>
      >
    >()
  })

  // ─── depth: 1 → relationships populated, nested relationships become IDs ──

  test('payload.findByID with depth: 1 returns populated relationships', () => {
    expect(payload.findByID({ id: '1', collection: 'posts', depth: 1 })).type.toBe<
      Promise<PostAtDepth1>
    >()
  })

  // ─── depth: 2 (default) → two levels of population ───────────────────────

  test('payload.findByID with depth: 2 returns two levels of population', () => {
    const result = payload.findByID({ id: '1', collection: 'posts', depth: 2 })

    // At depth 2: post.category is a Category object, and category.featuredPost is a Post object
    // At depth 2: category.featuredPost has its relationships as IDs (depth exhausted after 2 decrements)
    expect(result).type.toBe<
      Promise<{
        categories?:
          | {
              createdAt: string
              featuredPost?: {
                categories?: null | string[]
                category?: null | string
                createdAt: string
                id: string
                meta?: {
                  nestedRelation?: null | string
                }
                polymorphic?:
                  | ({
                      relationTo: 'categories'
                      value: string
                    } | null)
                  | {
                      relationTo: 'tags'
                      value: string
                    }
                title: string
                updatedAt: string
              } | null
              id: string
              name: string
              relatedPosts?: {
                docs?: {
                  categories?: null | string[]
                  category?: null | string
                  createdAt: string
                  id: string
                  meta?: {
                    nestedRelation?: null | string
                  }
                  polymorphic?:
                    | ({
                        relationTo: 'categories'
                        value: string
                      } | null)
                    | {
                        relationTo: 'tags'
                        value: string
                      }
                  title: string
                  updatedAt: string
                }[]
                hasNextPage?: boolean
                totalDocs?: number
              }
              updatedAt: string
            }[]
          | null
        category?: {
          createdAt: string
          featuredPost?: {
            categories?: null | string[]
            category?: null | string
            createdAt: string
            id: string
            meta?: {
              nestedRelation?: null | string
            }
            polymorphic?:
              | ({
                  relationTo: 'categories'
                  value: string
                } | null)
              | {
                  relationTo: 'tags'
                  value: string
                }
            title: string
            updatedAt: string
          } | null
          id: string
          name: string
          relatedPosts?: {
            docs?: {
              categories?: null | string[]
              category?: null | string
              createdAt: string
              id: string
              meta?: {
                nestedRelation?: null | string
              }
              polymorphic?:
                | ({
                    relationTo: 'categories'
                    value: string
                  } | null)
                | {
                    relationTo: 'tags'
                    value: string
                  }
              title: string
              updatedAt: string
            }[]
            hasNextPage?: boolean
            totalDocs?: number
          }
          updatedAt: string
        } | null
        createdAt: string
        id: string
        meta?: {
          nestedRelation?: {
            createdAt: string
            featuredPost?: {
              categories?: null | string[]
              category?: null | string
              createdAt: string
              id: string
              meta?: {
                nestedRelation?: null | string
              }
              polymorphic?:
                | ({
                    relationTo: 'categories'
                    value: string
                  } | null)
                | {
                    relationTo: 'tags'
                    value: string
                  }
              title: string
              updatedAt: string
            } | null
            id: string
            name: string
            relatedPosts?: {
              docs?: {
                categories?: null | string[]
                category?: null | string
                createdAt: string
                id: string
                meta?: {
                  nestedRelation?: null | string
                }
                polymorphic?:
                  | ({
                      relationTo: 'categories'
                      value: string
                    } | null)
                  | {
                      relationTo: 'tags'
                      value: string
                    }
                title: string
                updatedAt: string
              }[]
              hasNextPage?: boolean
              totalDocs?: number
            }
            updatedAt: string
          } | null
        }
        polymorphic?:
          | ({
              relationTo: 'categories'
              value: {
                createdAt: string
                featuredPost?: {
                  categories?: null | string[]
                  category?: null | string
                  createdAt: string
                  id: string
                  meta?: {
                    nestedRelation?: null | string
                  }
                  polymorphic?:
                    | ({
                        relationTo: 'categories'
                        value: string
                      } | null)
                    | {
                        relationTo: 'tags'
                        value: string
                      }
                  title: string
                  updatedAt: string
                } | null
                id: string
                name: string
                relatedPosts?: {
                  docs?: {
                    categories?: null | string[]
                    category?: null | string
                    createdAt: string
                    id: string
                    meta?: {
                      nestedRelation?: null | string
                    }
                    polymorphic?:
                      | ({
                          relationTo: 'categories'
                          value: string
                        } | null)
                      | {
                          relationTo: 'tags'
                          value: string
                        }
                    title: string
                    updatedAt: string
                  }[]
                  hasNextPage?: boolean
                  totalDocs?: number
                }
                updatedAt: string
              }
            } | null)
          | {
              relationTo: 'tags'
              value: {
                createdAt: string
                id: string
                label: string
                updatedAt: string
              }
            }
        title: string
        updatedAt: string
      }>
    >()
  })

  // ─── No depth specified → uses DefaultDepth (2 when typeSafeDepth enabled) ──

  test('payload.findByID without depth uses default depth (2)', () => {
    // Should be same as depth: 2
    const withDefault = payload.findByID({ id: '1', collection: 'posts' })
    const withExplicit = payload.findByID({ id: '1', collection: 'posts', depth: 2 })

    expect(withDefault).type.toBe<typeof withExplicit>()
  })

  // ─── Globals with depth ───────────────────────────────────────────────────

  test('payload.findGlobal with depth: 0 returns IDs', () => {
    expect(payload.findGlobal({ slug: 'settings', depth: 0 })).type.toBe<
      Promise<{
        createdAt?: null | string
        featuredPost?: null | string
        id: string
        siteName?: null | string
        updatedAt?: null | string
      }>
    >()
  })

  test('payload.findGlobal with depth: 1 returns populated relationships', () => {
    expect(payload.findGlobal({ slug: 'settings', depth: 1 })).type.toBe<
      Promise<{
        createdAt?: null | string
        featuredPost?: {
          categories?: null | string[]
          category?: null | string
          createdAt: string
          id: string
          meta?: {
            nestedRelation?: null | string
          }
          polymorphic?:
            | ({
                relationTo: 'categories'
                value: string
              } | null)
            | {
                relationTo: 'tags'
                value: string
              }
          title: string
          updatedAt: string
        } | null
        id: string
        siteName?: null | string
        updatedAt?: null | string
      }>
    >()
  })

  // ─── disableErrors + depth ────────────────────────────────────────────────

  test('payload.findByID with disableErrors and depth: 0', () => {
    expect(
      payload.findByID({ id: '1', collection: 'posts', disableErrors: true, depth: 0 }),
    ).type.toBe<
      Promise<{
        categories?: null | string[]
        category?: null | string
        createdAt: string
        id: string
        meta?: {
          nestedRelation?: null | string
        }
        polymorphic?:
          | ({
              relationTo: 'categories'
              value: string
            } | null)
          | {
              relationTo: 'tags'
              value: string
            }
        title: string
        updatedAt: string
      } | null>
    >()
  })

  // ─── ApplyDepth utility type tests ────────────────────────────────────────

  test('ApplyDepth with number (non-literal) passes through unchanged', () => {
    type Result = ApplyDepth<Post, number>
    expect<Result>().type.toBe<Post>()
  })

  test('ApplyDepth<Post, 0> resolves branded Post to its ID type (string)', () => {
    // ApplyDepth on a branded type at depth 0 returns the ID type.
    // This is correct for nested relationship fields — the top-level API uses ApplyDepthToResult.
    type Result = ApplyDepth<Post, 0>
    expect<Result>().type.toBe<string>()
  })

  test('ApplyDepth<Post, 1> populates one level, nested rels become IDs', () => {
    type Result = ApplyDepth<Post, 1>
    // At depth 1, Post is populated (brand stripped), but its nested Category relationships become IDs
    const result = {} as Result
    expect(result.category).type.toBe<null | string | undefined>()
    expect(result.title).type.toBe<string>()
  })
})
