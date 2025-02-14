<script lang="ts">
	import '../app.css';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import type { User } from '$lib/types';

	export const user = writable<User | null>(null);

	onMount(async () => {
		const {
			data: { session }
		} = await supabase.auth.getSession();
		if (session?.user) {
			const formattedUser: User = {
				id: session.user.id,
				email: session.user.email ?? '',
				role: session.user.role ?? '',
				aud: '',
				email_confirmed_at: '',
				phone: '',
				confirmation_sent_at: '',
				confirmed_at: '',
				last_sign_in_at: '',
				created_at: '',
				updated_at: '',
				is_anonymous: false
			};
			user.set(formattedUser);
		} else {
			user.set(null);
		}

		supabase.auth.onAuthStateChange((_event, session) => {
			if (session?.user) {
				const formattedUser: User = {
					id: session.user.id,
					email: session.user.email ?? '',
					role: session.user.role ?? '',
					aud: '',
					email_confirmed_at: '',
					phone: '',
					confirmation_sent_at: '',
					confirmed_at: '',
					last_sign_in_at: '',
					created_at: '',
					updated_at: '',
					is_anonymous: false
				};
				user.set(formattedUser);
			} else {
				user.set(null);
			}
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
					{#if $user}
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
		<slot user={$user} />
	</main>
</div>
