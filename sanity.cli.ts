import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID || 'akpi9bfm',
    dataset: process.env.NUXT_PUBLIC_SANITY_DATASET || 'production',
  },
  // Hostname pour le studio en ligne -> https://misana.sanity.studio
  studioHost: 'misana',
  deployment: {
    appId: 'gxn3j4t7rrouhe7b4a0ltcbz',
  },
});
