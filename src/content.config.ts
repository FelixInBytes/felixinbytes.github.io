import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";
import { parseGitHubRepo } from "./lib/github-validation";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string().optional(),
    github: z
      .string()
      .refine((value) => parseGitHubRepo(value) !== null, {
        message: "Must be a valid GitHub repo slug or URL",
      }),
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, projects };
