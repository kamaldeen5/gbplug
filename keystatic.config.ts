import { config, fields, collection } from '@keystatic/core';

const isGitHub =
  typeof process !== 'undefined' &&
  Boolean(process.env.KEYSTATIC_GITHUB_CLIENT_ID);

export default config({
  storage: isGitHub
    ? {
        kind: 'github',
        repo: {
          owner: 'kamaldeen5',
          name: 'gbplug',
        },
      }
    : {
        kind: 'local',
      },
  ui: {
    brand: {
      name: 'GB Plug CMS',
    },
  },
  collections: {
    posts: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      entryLayout: 'content',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Post Title' } }),
        publishedDate: fields.date({
          label: 'Published Date',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
        }),
        author: fields.text({
          label: 'Author Name',
          defaultValue: 'GB Plug Editorial Desk',
        }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'MTN Data Guides', value: 'mtn' },
            { label: 'Telecel Guides', value: 'telecel' },
            { label: 'AirtelTigo Guides', value: 'airteltigo' },
            { label: 'Save Money on Data', value: 'tips' },
            { label: 'Internet & Tech Ghana', value: 'tech' },
          ],
          defaultValue: 'mtn',
        }),
        summary: fields.text({
          label: 'SEO Summary / Meta Description',
          description: 'Short 1-2 sentence description shown in Google search results and post cards.',
          multiline: true,
          validation: { isRequired: true },
        }),
        coverImage: fields.image({
          label: 'Cover Image',
          directory: 'public/images/posts',
          publicPath: '/images/posts/',
        }),
        content: fields.document({
          label: 'Article Content',
          formatting: true,
          dividers: true,
          links: true,
          images: {
            directory: 'public/images/posts',
            publicPath: '/images/posts/',
          },
        }),
      },
    }),
  },
});
