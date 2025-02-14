import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	base: '/BlogSvelte-Supabase/',
	server: {
		fs: {
			strict: false
		}
	}
});
