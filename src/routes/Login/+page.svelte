<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';

	let email: string = '';
	let password: string = '';
	let error: string = '';

	async function handleLogin(): Promise<void> {
		try {
			const { data, error: err } = await supabase.auth.signInWithPassword({
				email: email.trim(),
				password: password.trim()
			});
			if (err) {
				console.error('Supabase error:', err);
				throw err;
			}
			console.log('Login successful:', data);
			goto('/');
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unexpected error occurred';
			console.error('Error during login:', error);
		}
	}
</script>

<div class="mx-auto max-w-md">
	<h1 class="mb-6 text-2xl font-bold">Login</h1>
	<form on:submit|preventDefault={handleLogin} class="space-y-4">
		<div>
			<label for="email" class="mb-2 block">Email</label>
			<input type="email" bind:value={email} class="w-full rounded border p-2" required />
		</div>
		<div>
			<label for="password" class="mb-2 block">Password</label>
			<input type="password" bind:value={password} class="w-full rounded border p-2" required />
		</div>
		{#if error}
			<p class="text-red-500">{error}</p>
		{/if}
		<button type="submit" class="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600">
			Login
		</button>
	</form>
</div>
