self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "/admin/credit-notifications",
    self.location.origin,
  ).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (windowClients) => {
        for (const client of windowClients) {
          if (client.url.startsWith(self.location.origin)) {
            await client.navigate(targetUrl);
            return client.focus();
          }
        }

        return clients.openWindow(targetUrl);
      }),
  );
});
self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      body: event.data ? event.data.text() : "",
    };
  }

  const title = data.title || "Abdu Mart — Credit Activity";

  const options = {
    body:
      data.body ||
      data.message ||
      "A new credit sale or repayment was recorded.",
    icon: "/shoping-favicon.png",
    badge: "/favicon.ico",
    tag: `abdu-mart-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || "/admin/credit-notifications",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
