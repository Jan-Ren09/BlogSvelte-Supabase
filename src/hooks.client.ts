import { goto } from '$app/navigation';

export function handleNavigation(event: Event) {
	if (event instanceof PopStateEvent) return;
	if (!(event.target instanceof HTMLAnchorElement)) return;

	const url = new URL(event.target.href);
	if (url.origin === location.origin) {
		event.preventDefault();
		goto('#' + url.pathname + url.search);
	}
}

window.addEventListener('click', handleNavigation);
