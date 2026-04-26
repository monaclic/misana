import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID || 'akpi9bfm',
    dataset: process.env.NUXT_PUBLIC_SANITY_DATASET || 'production',
  },
});
