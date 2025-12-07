// ----- Cache versions -----
// Auto-generated version based on service worker registration time
const BUILD_HASH =
  self.__BUILD_MANIFEST?.buildId ??
  `v${new Date().toISOString().split("T")[0].replace(/-/g, "")}`

const STATIC_CACHE = `school-base-static-${BUILD_HASH}`
const API_CACHE = `school-base-api-${BUILD_HASH}`
const IMAGE_CACHE = `school-base-img-${BUILD_HASH}`
const OFFLINE_URL = "/offline.html"
const MAX_IMAGE_ENTRIES = 60

// ----- Install: pre-cache app shell -----
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE)
      await cache.addAll([
        "/",
        "/login",
        "/offline.html",
        "/manifest.json",
        "/icons/android-chrome-192x192.png",
        "/icons/android-chrome-512x512.png",
        "/icons/apple-touch-icon.png",
      ])
      self.skipWaiting()
    })()
  )
})

// ----- Activate: clean old caches -----
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.map((key) => {
          if (![STATIC_CACHE, API_CACHE, IMAGE_CACHE].includes(key)) {
            return caches.delete(key)
          }
        })
      )
      await self.clients.claim()
    })()
  )
})

// Utility: trim cache entries (simple FIFO)
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length > maxEntries) {
    const toDelete = keys.slice(0, keys.length - maxEntries)
    await Promise.all(toDelete.map((req) => cache.delete(req)))
  }
}

// ----- Message handling for updates -----
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// ----- Fetch strategies -----
self.addEventListener("fetch", (event) => {
  const { request } = event

  // Only handle same-origin requests
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Skip handling for admin paths
  if (
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/teacher") ||
    url.pathname.startsWith("/student") ||
    url.pathname.startsWith("/parent") ||
    url.pathname.startsWith("/super-admin")
  ) {
    // These requests will bypass the Service Worker and go directly to the network.
    return
  }

  // HTML navigations: network-first with offline fallback (with iOS fix)
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const networkResp = await fetch(request)
          // Only cache successful responses and only for GET requests
          if (networkResp && networkResp.status === 200 && request.method === "GET") {
            const cache = await caches.open(STATIC_CACHE)
            cache.put(request, networkResp.clone())
          }
          return networkResp
        } catch {
          // For iOS PWA, try cache first, then offline page
          const cacheMatch = await caches.match(request)
          return cacheMatch || caches.match(OFFLINE_URL)
        }
      })()
    )
    return
  }

  // API requests: stale-while-revalidate
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(API_CACHE)
        const cached = await cache.match(request)
        const networkPromise = fetch(request)
          .then((resp) => {
            // Only cache successful API responses and only for GET requests
            if (resp && resp.status === 200 && request.method === "GET") {
              cache.put(request, resp.clone())
            }
            return resp
          })
          .catch(() => undefined)
        return cached || (await networkPromise) || new Response(null, { status: 504 })
      })()
    )
    return
  }

  // Images: network-first, falling back to cache
  if (request.destination === "image") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(IMAGE_CACHE)
        try {
          // Try network first
          const networkResponse = await fetch(request)
          // If successful, cache it and return it (only for GET requests)
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            request.method === "GET"
          ) {
            cache.put(request, networkResponse.clone())
            await trimCache(IMAGE_CACHE, MAX_IMAGE_ENTRIES)
          }
          return networkResponse
        } catch {
          // If network fails, try to serve from cache
          const cachedResponse = await cache.match(request)
          if (cachedResponse) {
            return cachedResponse
          }
          // If not in cache either, the request will fail, which is the expected browser behavior.
          return new Response(null, { status: 404, statusText: "Not Found" })
        }
      })()
    )
    return
  }

  // Default: try cache, then network (only for GET requests)
  if (request.method === "GET") {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request)
        return cached || fetch(request)
      })()
    )
  }
})

// ----- Push Notification Handling -----
self.addEventListener("push", (event) => {
  console.log("[ServiceWorker] Push received:", event)

  let title = "School Base Update"
  let options = {
    body: "You have a new notification",
    icon: "/icons/android-chrome-192x192.png",
    badge: "/icons/android-chrome-192x192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: "1",
    },
    actions: [
      {
        action: "explore",
        title: "View",
        icon: "/icons/android-chrome-192x192.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icons/android-chrome-192x192.png",
      },
    ],
  }

  // If we have payload data, use it
  if (event.data) {
    const data = event.data.json()
    title = data.title || title
    options.body = data.message || options.body
    options.data = data

    // Add image if provided
    if (data.imageUrl) {
      options.image = data.imageUrl
    }
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  console.log("[ServiceWorker] Notification click received.")

  event.notification.close()

  // Handle action clicks
  if (event.action === "explore") {
    event.waitUntil(
      clients.openWindow("/notifications") // dummy route, update with actual notifications page when ready
    )
  } else if (event.action === "close") {
    // Just close the notification
    return
  } else {
    // Default action - open home page
    event.waitUntil(clients.openWindow("/"))
  }
})
