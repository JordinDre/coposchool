// ─────────────────────────────────────────────
// COPO Service Worker — Offline-first PWA
// ─────────────────────────────────────────────
const CACHE_VERSION = 'copo-v1';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Assets to pre-cache on install
const PRE_CACHE = [
    '/offline.html',
];

// Patterns that should use cache-first (static assets)
const CACHE_FIRST_PATTERNS = [
    /\/build\//,         // Vite-compiled assets
    /\/fonts\//,         // Fonts
    /\/images\//,        // Images
    /\.(?:js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/,
];

// Patterns that should NEVER be cached
const NO_CACHE_PATTERNS = [
    /\/manifest\.webmanifest$/,
    /\/livewire\//,
    /\/broadcasting\//,
    /\/sanctum\//,
    /\/_debugbar\//,
    /\/horizon\//,
];

// ── Install ──────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll(PRE_CACHE))
            .then(() => self.skipWaiting())
    );
});

// ── Activate — clean old caches ──────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
                        .map((key) => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});

// ── Fetch — routing strategy ─────────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Only handle GET requests
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== self.location.origin) return;

    // Skip no-cache patterns
    if (NO_CACHE_PATTERNS.some((p) => p.test(url.pathname))) return;

    // Cache-first for static assets
    if (CACHE_FIRST_PATTERNS.some((p) => p.test(url.pathname) || p.test(url.href))) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // Network-first for navigation & API (Inertia pages)
    if (request.mode === 'navigate' || request.headers.get('X-Inertia')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Default: network-first
    event.respondWith(networkFirst(request));
});

// ── Cache-first strategy ─────────────────────
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return new Response('', { status: 408, statusText: 'Offline' });
    }
}

// ── Network-first strategy ───────────────────
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok && request.method === 'GET') {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;

        // If it's a navigation request, show the offline page
        if (request.mode === 'navigate') {
            return caches.match('/offline.html');
        }

        return new Response('', { status: 408, statusText: 'Offline' });
    }
}
