const CACHE_NAME = "my-app-cache-v2";
const APP_SHELL_URLS = ["/"];

// Install the service worker and cache the application shell
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log("Opened cache");
			return cache.addAll(APP_SHELL_URLS);
		}),
	);
});

self.addEventListener("fetch", (event) => {
	const { request } = event;

	// For navigation requests, use a network-first strategy
	if (request.mode === "navigate") {
		event.respondWith(
			fetch(request)
				.then((response) => {
					// Clone the response and cache it
					const responseToCache = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(request, responseToCache);
					});
					return response;
				})
				.catch(() => {
					// If network fails, serve from cache
					return caches.match(request);
				}),
		);
	} else {
		// For non-navigation requests (assets), use a cache-first strategy
		event.respondWith(
			caches.match(request).then((response) => {
				// Return from cache or fetch from network
				return (
					response ||
					fetch(request).then((fetchResponse) => {
						// Clone the response and cache it for future use
						const responseToCache = fetchResponse.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(request, responseToCache);
						});
						return fetchResponse;
					})
				);
			}),
		);
	}
});

// Clean up old caches
self.addEventListener("activate", (event) => {
	const cacheWhitelist = [CACHE_NAME];
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheWhitelist.indexOf(cacheName) === -1) {
						return caches.delete(cacheName);
					}
					return Promise.resolve(); // Explicit return for the else case
				}),
			);
		}),
	);
});
