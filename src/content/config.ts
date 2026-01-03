import { defineCollection, z } from 'astro:content';

const projectsCollection = defineCollection({
	type: 'content', // v2.5.0+ content collections
	schema: ({ image }) => z.object({
		title: z.string(),
		description: z.string(),
		date: z.date(),
		tags: z.array(z.string()),
		heroImage: image().optional(),
		ogImage: z.string().optional(),
		githubUrl: z.string().url().optional(),
		liveUrl: z.string().url().optional(),
		featured: z.boolean().default(false),
	}),
});

export const collections = {
	'projects': projectsCollection,
};
