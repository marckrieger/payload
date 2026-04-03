import { fileURLToPath } from 'node:url'
import path from 'path'

import { buildConfigWithDefaults } from '../buildConfigWithDefaults.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfigWithDefaults({
  collections: [
    {
      slug: 'posts',
      fields: [
        {
          type: 'text',
          name: 'title',
          required: true,
        },
        {
          type: 'relationship',
          relationTo: 'categories',
          name: 'category',
        },
        {
          type: 'relationship',
          relationTo: 'categories',
          name: 'categories',
          hasMany: true,
        },
        {
          type: 'relationship',
          relationTo: ['categories', 'tags'],
          name: 'polymorphic',
        },
        {
          type: 'group',
          name: 'meta',
          fields: [
            {
              type: 'relationship',
              relationTo: 'categories',
              name: 'nestedRelation',
            },
          ],
        },
      ],
    },
    {
      slug: 'categories',
      fields: [
        {
          type: 'text',
          name: 'name',
          required: true,
        },
        {
          type: 'relationship',
          relationTo: 'posts',
          name: 'featuredPost',
        },
        {
          type: 'join',
          name: 'relatedPosts',
          collection: 'posts',
          on: 'category',
        },
      ],
    },
    {
      slug: 'tags',
      fields: [
        {
          type: 'text',
          name: 'label',
          required: true,
        },
      ],
    },
  ],
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  globals: [
    {
      slug: 'settings',
      fields: [
        {
          type: 'text',
          name: 'siteName',
        },
        {
          type: 'relationship',
          relationTo: 'posts',
          name: 'featuredPost',
        },
      ],
    },
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
    typeSafeDepth: true,
  },
})
