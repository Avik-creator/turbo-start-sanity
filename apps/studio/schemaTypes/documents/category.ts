import { defineField, defineType } from 'sanity';
import { seoFields } from '../../utils/seo-fields';
import { createSlug, isUnique } from '../../utils/slug';
import { GROUPS } from '../../utils/constant';

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  description: 'A blog category for grouping posts',
  groups: GROUPS,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'title',
        slugify: createSlug,
        isUnique,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      rows: 2,
    }),
    ...seoFields,
  ],
}); 