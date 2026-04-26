import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schema } from './sanity/schemas';

const projectId = process.env.NUXT_PUBLIC_SANITY_PROJECT_ID || 'akpi9bfm';
const dataset = process.env.NUXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NUXT_PUBLIC_SANITY_API_VERSION || '2026-04-26';

export default defineConfig({
  basePath: '/studio',
  name: 'misana',
  title: 'Misana',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool(),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
