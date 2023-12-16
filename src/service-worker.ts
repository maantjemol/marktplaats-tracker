/// <reference lib="webworker" />

import { build, files } from '$service-worker';

const worker = self as unknown as ServiceWorkerGlobalScope;
const FILES = `cache`;

// `build` is an array of all the files generated by the bundler,
// `files` is an array of everything in the `static` directory
const to_cache = build.concat(files);

worker.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(FILES)
			.then((cache) => cache.addAll(to_cache))
			.then(() => {
				worker.skipWaiting();
			})
	);
});

worker.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			// delete old caches
			for (const key of keys) {
				if (key !== FILES) await caches.delete(key);
			}

			worker.clients.claim();
		})
	);
});

worker.addEventListener('push', (event) => {
	if (!event.data) return;
	event.waitUntil(
		worker.registration.showNotification('HI!', {
			body: event.data.text() ?? 'Hello world'
		})
	);
});
