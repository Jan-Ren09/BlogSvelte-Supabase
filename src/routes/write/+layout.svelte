<script lang="ts">
	import { currentUser } from '$lib/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let user: any;

	onMount(() => {
		const unsubscribe = currentUser.subscribe((value) => {
			user = value;
			if (!user) {
				goto('/login');
			}
		});
		return () => unsubscribe();
	});
</script>

{#if user}
	<slot />
{/if}
