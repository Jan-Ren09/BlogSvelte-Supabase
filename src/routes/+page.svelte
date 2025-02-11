<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { onMount } from 'svelte';

	let posts = [];
	let currentPage = 1;
	let totalPages = 1;
	const postsPerPage = 10;
	let loading = true;
	let error = '';

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
			totalPages = Math.ceil(count / postsPerPage);
		} catch (err) {
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
				<h2 class="mb-2 text-xl font-bold">
					<a href="/edit/{post.id}" class="hover:text-blue-600">{post.title}</a>
				</h2>
				<p class="mb-4 text-gray-600">{formatDate(post.created_at)}</p>
				<p class="text-gray-800">{post.content.substring(0, 200)}...</p>
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
