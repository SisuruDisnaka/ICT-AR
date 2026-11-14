self.addEventListener("fetch", (e) => {
  if (
    e.request.method !== "GET" ||
    !e.request.url.startsWith(self.location.origin)
  )
    return;
  e.respondWith(
    caches.open("ict-sisuru-v1").then(async (c) => {
      const hit = await c.match(e.request);
      const net = fetch(e.request)
        .then((r) => {
          if (r.ok) c.put(e.request, r.clone());
          return r;
        })
        .catch(() => hit);
      return hit || net;
    }),
  );
});
