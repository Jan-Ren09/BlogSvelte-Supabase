<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let error = '';

	async function handleRegister() {
		error = ''; // Reset error state
		const trimmedEmail = email.trim();

		if (!trimmedEmail) {
			error = 'Email cannot be empty';
			return;
		}

		const { data, error: err } = await supabase.auth.signUp({
			email: trimmedEmail,
			password
		});

		if (err) {
			error = err.message;
			return;
		}

		goto('/Login');
	}
</script>

<div class="mx-auto max-w-md">
	<h1 class="mb-6 text-2xl font-bold">Register</h1>
	<form on:submit|preventDefault={handleRegister} class="space-y-4">
		<div>
			<label for="email" class="mb-2 block">Email</label>
			<input type="email" bind:value={email} class="w-full rounded border p-2" required />
		</div>
		<div>
			<label for="password" class="mb-2 block">Password</label>
			<input
				type="password"
				bind:value={password}
				class="w-full rounded border p-2"
				required
				minlength="6"
			/>
		</div>
		{#if error}
			<p class="text-red-500">{error}</p>
		{/if}
		<button type="submit" class="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600">
			Register
		</button>
	</form>
</div>
