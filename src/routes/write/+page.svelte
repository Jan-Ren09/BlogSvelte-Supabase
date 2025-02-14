<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { currentUser } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let title = '';
	let content = '';
	let loading = false;
	let error: string | null = null;
	let user: any;

	onMount(() => {
		const unsubscribe = currentUser.subscribe((value) => {
			user = value;
		});
		return () => unsubscribe();
	});

	async function handleSubmit() {
		if (!user) {
			error = 'You must be logged in to create a blog post';
			return;
		}

		try {
			loading = true;

			const { data, error: err } = await supabase.from('posts').insert([
				{
					title,
					content,
					author_email: user.email,
					author_id: user.id
				}
			]);

			if (err) {
				throw err;
			}

			goto('/');
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			}
		} finally {
			loading = false;
		}
	}
</script>

<div class="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-lg">
	<h1 class="mb-6 text-xl font-bold">Write a Blog Post</h1>

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		{#if error}
			<div class="rounded border border-red-400 bg-red-100 p-3 text-red-700">{error}</div>
		{/if}

		<div>
			<label class="mb-2 block font-medium text-gray-700" for="title">Title</label>
			<input
				type="text"
				id="title"
				bind:value={title}
				class="w-full rounded border border-gray-300 p-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
				required
			/>
		</div>

		<div>
			<label class="mb-2 block font-medium text-gray-700" for="content">Content</label>
			<textarea
				id="content"
				bind:value={content}
				rows="10"
				class="p-2shadow-sm w-full rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
				required
			></textarea>
		</div>

		<button
			type="submit"
			disabled={loading}
			class="w-full rounded bg-green-600 p-3 text-white shadow-md hover:bg-green-900 disabled:opacity-50"
		>
			{loading ? 'Publishing...' : 'Publish'}
		</button>
	</form>
</div>
