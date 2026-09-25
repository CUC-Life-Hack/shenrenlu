import { defineConfig } from 'astro/config';
import storyAssets from './src/integrations/story-assets.mjs';

export default defineConfig({
	site: 'https://CUC-Life-Hack.github.io',
	base: '/shenrenlu',
	trailingSlash: 'always',
	integrations: [storyAssets()],
});
