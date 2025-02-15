import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({ fallback: 'index.html' }),
		paths: {
			base: process.env.NODE_ENV === 'production' ? '/BlogSvelte-Supabase' : ''
		},
		appDir: '_app',
		prerender: {
			entries: ['*']
		},
		trailingSlash: 'always'
	}
};

export default config;
