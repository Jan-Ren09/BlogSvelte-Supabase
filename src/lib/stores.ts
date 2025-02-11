import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { User } from '@supabase/supabase-js';

export const currentUser = writable<User | null>(null);

async function loadUser() {
	const { data, error } = await supabase.auth.getUser();
	if (!error) {
		currentUser.set(data.user);
	} else {
		currentUser.set(null);
	}
}

// Subscribe to auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
	currentUser.set(session?.user ?? null);
});

// Initial load
loadUser();
