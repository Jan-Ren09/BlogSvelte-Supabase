<script lang="ts">
	import { supabase } from '$lib/supabase';
	import type { Database } from '../../database.types';
	import { writable } from 'svelte/store';
	import { currentUser } from '$lib/stores';

	type Posts = Database['public']['Tables']['posts']['Row'];

	let posts: Posts[];
	let currentPage = 1;
	let totalPages = 1;
	const postsPerPage = 5;
	let loading = true;
	let error = '';
	const expanded = writable<{ [key: string]: boolean }>({});

	async function fetchPosts() {
		try {
			loading = true;
			const from = (currentPage - 1) * postsPerPage;
			const to = from + postsPerPage - 1;

			const {
				data,
				error: err,
				count
			} = await supabase
				.from('posts')
				.select('*', { count: 'exact' })
				.order('created_at', { ascending: false })
				.range(from, to);

			if (err) throw err;

			posts = data;
			totalPages = count !== null ? Math.ceil(count / postsPerPage) : 1;
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	$: {
		if (currentPage) {
			fetchPosts();
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString();
	}

	function truncate(title: string, maxLength = 20) {
		return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
	}

	function toggleExpand(postId: number) {
		expanded.update((state) => ({
			...state,
			[postId]: !state[postId]
		}));
	}
</script>

<div class="space-y-6">
	<h1 class="text-3xl font-bold">Blog Posts</h1>

	{#if loading}
		<p>Loading...</p>
	{:else if error}
		<p class="text-red-500">{error}</p>
	{:else if posts.length === 0}
		<p>No posts found.</p>
	{:else}
		{#each posts as post}
			<article class="rounded-lg bg-white p-6 shadow">
				<p class="flex justify-end text-xs text-gray-600">{formatDate(post.created_at)}</p>

				<h2 class="font-semibold">
					<div title={post.title}>
						{#if $expanded[post.id]}
							{post.title}
						{:else}
							{truncate(post.title, 30)}
						{/if}
					</div>
				</h2>

				<p class="text-gray-800">
					{#if $expanded[post.id]}
						{post.content}
					{:else}
						{truncate(post.content, 100)}
					{/if}
				</p>

				<div class="flex justify-between">
					<button
						on:click={() => toggleExpand(post.id)}
						class="mt-2 text-xs text-blue-600 hover:underline"
					>
						{#if $expanded[post.id]}
							See Less
						{:else}
							See Full
						{/if}
					</button>
					{#if post.author_email === $currentUser?.email}
						<a href={`/edit/${post.id}`} class="mt-2 text-xs text-green-600 hover:underline">
							Edit / Delete
						</a>
					{/if}
				</div>
			</article>
		{/each}

		<div class="mt-6 flex justify-center space-x-2">
			{#each Array(totalPages) as _, i}
				<button
					class="rounded px-3 py-1 {currentPage === i + 1
						? 'bg-blue-500 text-white'
						: 'bg-gray-200'}"
					on:click={() => (currentPage = i + 1)}
				>
					{i + 1}
				</button>
			{/each}
		</div>
	{/if}
</div>
