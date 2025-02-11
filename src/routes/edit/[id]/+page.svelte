<script lang="ts">
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { currentUser } from '$lib/stores';

	interface Post {
		id: string;
		title: string;
		content: string;
		author_id: string;
	}

	const post = writable<Post | null>(null);
	const error = writable<string | null>(null);
	let loading = writable<boolean>(true);
	let subscription;
	let user = null;

	// 🟢 Get current user
	onMount(() => {
		const unsubscribe = currentUser.subscribe((value) => {
			user = value;
		});
		return () => unsubscribe();
	});

	// 🟡 Load post data
	async function loadPost(postId: string) {
		console.log('🔄 Fetching post...', postId);
		const { data, error: err } = await supabase.from('posts').select('*').eq('id', postId).single();

		if (err) {
			error.set(err.message);
			console.error('❌ Fetch Error:', err);
			return;
		}

		console.log('✅ Post Loaded:', data);
		post.set(data);
		loading.set(false);
	}

	// 🔄 Handle real-time updates
	function subscribeToPost(postId: string) {
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
					console.log('🔔 Realtime update received:', payload);

					if (payload.eventType === 'DELETE') {
						console.log('🗑️ Post deleted, redirecting...');
						await goto('/');
					} else {
						console.log('📝 Post updated, reloading...');
						await loadPost(postId);
					}
				}
			)
			.subscribe();
	}

	// 🎯 Load post on mount
	onMount(async () => {
		console.log('🔧 Component mounted');

		const unsubscribe = page.subscribe(async ($page) => {
			const postId = $page.params.id;
			if (postId) {
				await loadPost(postId);
				subscribeToPost(postId);
			}
		});

		return () => {
			unsubscribe();
		};
	});

	// 🧹 Cleanup subscription
	onDestroy(() => {
		console.log('🧹 Cleaning up subscription');
		if (subscription) {
			supabase.removeChannel(subscription);
		}
	});

	// ✏️ Handle post update
	async function handleSubmit() {
		let $post;
		post.subscribe((value) => ($post = value))();

		if (!$post) return;

		try {
			const { error: err } = await supabase
				.from('posts')
				.update({
					title: $post.title,
					content: $post.content
				})
				.eq('id', $post.id); // Remove .eq('author_id', user.id) since policy handles auth

			if (err) throw err;
			console.log('✅ Update successful');
			await goto('/');
		} catch (err) {
			error.set(err.message);
			console.error('❌ Update Error:', err);
		}
	}
	// 🗑️ Handle delete post
	async function handleDelete() {
		const postValue = get(post); // Get current post value

		if (!confirm('🚨 Are you sure you want to delete this post?')) return;

		const { data, error: err } = await supabase
			.from('posts')
			.delete()
			.match({ id: postValue?.id })
			.select();

		if (err) {
			error.set(err.message);
			return;
		}

		if (data?.length) {
			await goto('/');
		}
	}
</script>

<!-- UI -->
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

			<div class="flex space-x-4">
				<button type="submit" class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
					Update
				</button>
				<button
					type="button"
					on:click={handleDelete}
					class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
				>
					Delete
				</button>
			</div>
		</form>
	{/if}
</div>
