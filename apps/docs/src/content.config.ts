import { defineCollection, z } from 'astro:content';
import { asciidocLoader } from '@olympia/theme/loader';
import { BADGE_VARIANTS, DEFAULT_CATEGORY, DEFAULT_ORDER } from '@olympia/theme';

const docs = defineCollection({
  loader: asciidocLoader({ base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    category: z.string().default(DEFAULT_CATEGORY),
    order: z.number().default(DEFAULT_ORDER),
    badge: z.string().optional(),
    badgeVariant: z.enum(BADGE_VARIANTS).optional(),
    httpMethod: z.string().optional(),
    endpoint: z.string().optional(),
    attributes: z.record(z.string(), z.string()).default({}),
    headings: z
      .array(
        z.object({
          depth: z.number(),
          slug: z.string(),
          text: z.string(),
        })
      )
      .default([]),
  }),
});

export const collections = { docs };
