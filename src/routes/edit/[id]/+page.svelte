<script lang="ts">
	import { page } from '$app/state';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { writable, get } from 'svelte/store';
	import { currentUser } from '$lib/stores';
	import type { Database } from '../../../../database.types';

	type Posts = Database['public']['Tables']['posts']['Row'];

	const post = writable<Posts | null>(null);
	const error = writable<string | null>(null);
	const loading = writable<boolean>(true);
	let subscription: any;
	let user = null;

	onMount(() => {
		const unsubscribe = currentUser.subscribe((value) => {
			user = value;
		});
		return () => unsubscribe();
	});

	async function loadPost(postId: number) {
		const { data, error: err } = await supabase.from('posts').select('*').eq('id', postId).single();

		if (err) {
			error.set(err.message);
			return;
		}

		post.set(data);
		loading.set(false);
	}

	function subscribeToPost(postId: number) {
		subscription = supabase
			.channel(`post-${postId}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'posts',
					filter: `id=eq.${postId}`
				},
				async (payload) => {
					if (payload.eventType === 'DELETE') {
						await goto('/');
					} else {
						await loadPost(postId);
					}
				}
			)
			.subscribe();
	}

	onMount(() => {
		const postId = Number(page.params.id);
		if (postId) {
			loadPost(postId);
			subscribeToPost(postId);
		}

		return () => {
			if (subscription) {
				supabase.removeChannel(subscription);
			}
		};
	});

	async function handleSubmit() {
		const $post = get(post);

		if (!$post) return;

		try {
			const { error: err } = await supabase
				.from('posts')
				.update({
					title: $post.title,
					content: $post.content
				})
				.eq('id', $post.id);

			if (err) throw err;
			await goto('/');
		} catch (err: any) {
			error.set(err.message);
		}
	}

	async function handleDelete() {
		const $post = get(post);

		if (!confirm('🚨 Are you sure you want to delete this post?')) return;

		const { error: err } = await supabase.from('posts').delete().eq('id', Number($post?.id));

		if (err) {
			error.set(err.message);
			return;
		}

		await goto('/');
	}
</script>

<div class="mx-auto max-w-3xl">
	<h1 class="mb-6 text-2xl font-bold">Edit Blog Post</h1>

	{#if $loading}
		<p>Loading...</p>
	{:else if $error}
		<p class="text-red-500">{$error}</p>
	{:else if $post}
		<form on:submit|preventDefault={handleSubmit} class="space-y-4">
			<div>
				<label for="title" class="mb-2 block">Title</label>
				<input
					type="text"
					id="title"
					bind:value={$post.title}
					class="w-full rounded border p-2"
					required
				/>
			</div>
			<div>
				<label for="content" class="mb-2 block">Content</label>
				<textarea
					id="content"
					bind:value={$post.content}
					class="h-64 w-full rounded border p-2"
					required
				></textarea>
			</div>

			{#if $error}
				<p class="text-red-500">{$error}</p>
			{/if}

			<div class="flex flex-row justify-between">
				<div>
					<button
						type="button"
						on:click={handleDelete}
						class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
					>
						Delete
					</button>
					<button type="submit" class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
						Update
					</button>
				</div>
				<a href="/" type="button" class="rounded bg-black px-4 py-2 text-white"> Cancel </a>
			</div>
		</form>
	{/if}
</div>
