<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { currentUser } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let title = '';
	let content = '';
	let loading = false;
	let error: string | null = null;
	let user = null;

	// Ensure we have the authenticated user
	onMount(() => {
		const unsubscribe = currentUser.subscribe((value) => {
			user = value;
			console.log('Current User:', user);
		});
		return () => unsubscribe();
	});

	async function handleSubmit() {
		console.log('Submitting form...');
		if (!user) {
			error = 'You must be logged in to create a blog post';
			console.error(error);
			return;
		}

		try {
			loading = true;

			console.log('Inserting into blogs table:', {
				title,
				content,
				author_email: user.email,
				author_id: user.id
			});

			const { data, error: err } = await supabase.from('posts').insert([
				{
					title,
					content,
					author_email: user.email,
					author_id: user.id
				}
			]);

			console.log('Supabase response:', { data, err });

			if (err) {
				console.error('Supabase error:', err);
				throw err;
			}

			goto('/');
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
				console.error('Catch block error:', err);
			}
		} finally {
			loading = false;
		}
	}
</script>

<div class="mx-auto max-w-2xl">
	<h1 class="mb-6 text-3xl font-bold text-white">Write a Blog Post</h1>

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		{#if error}
			<div class="rounded bg-red-500 p-3 text-white">{error}</div>
		{/if}

		<div>
			<label class="mb-2 block text-white" for="title">Title</label>
			<input
				type="text"
				id="title"
				bind:value={title}
				class="w-full rounded bg-gray-700 p-2 text-white"
				required
			/>
		</div>

		<div>
			<label class="mb-2 block text-white" for="content">Content</label>
			<textarea
				id="content"
				bind:value={content}
				rows="10"
				class="w-full rounded bg-gray-700 p-2 text-white"
				required
			></textarea>
		</div>

		<button
			type="submit"
			disabled={loading}
			class="w-full rounded bg-red-600 p-3 text-white hover:bg-red-700 disabled:opacity-50"
		>
			{loading ? 'Publishing...' : 'Publish'}
		</button>
	</form>
</div>
