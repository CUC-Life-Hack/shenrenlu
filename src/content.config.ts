import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const stories = defineCollection({
	loader: glob({
		base: './stories',
		pattern: '**/index.md',
	}),
	schema: z.object({
		title: z.string(),
	}),
});

export const collections = { stories };
