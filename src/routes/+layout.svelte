<script lang="ts">
	import '../app.css';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let user = null;

	onMount(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			user = session?.user ?? null;
		});

		supabase.auth.onAuthStateChange((_event, session) => {
			user = session?.user ?? null;
		});
	});

	async function signOut() {
		await supabase.auth.signOut();
		goto('/Login');
	}
</script>

<div class="min-h-screen bg-gray-100">
	<nav class="bg-white shadow-lg">
		<div class="mx-auto max-w-6xl px-4">
			<div class="flex h-16 items-center justify-between">
				<a href="/" class="text-xl font-bold">Blog</a>
				<div class="flex items-center space-x-4">
					{#if user}
						<a href="/write" class="text-gray-700 hover:text-gray-900">Write</a>
						<button on:click={signOut} class="text-gray-700 hover:text-gray-900">Sign Out</button>
					{:else}
						<a href="/Login" class="text-gray-700 hover:text-gray-900">Login</a>
						<a href="/register" class="text-gray-700 hover:text-gray-900">Register</a>
					{/if}
				</div>
			</div>
		</div>
	</nav>
	<main class="mx-auto max-w-6xl px-4 py-8">
		<slot />
	</main>
</div>
