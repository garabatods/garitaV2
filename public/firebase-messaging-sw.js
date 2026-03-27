importScripts("https://www.gstatic.com/firebasejs/12.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.10.0/firebase-messaging-compat.js");
importScripts("/firebase-config.js");

firebase.initializeApp(self.garitaWatchFirebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notification = payload.notification || {};
    const data = payload.data || {};
    const title = notification.title || "Garita Watch alert";
    const body = notification.body || "A wait-time alert was triggered.";
    const link = data.link || "/";

    self.registration.showNotification(title, {
        badge: "/favicon.ico",
        body,
        data: { link },
        icon: "/favicon.ico",
        tag: data.alert_id || "garita-watch-alert",
    });
});

self.addEventListener("notificationclick", (event) => {
    const targetLink = event.notification?.data?.link || "/";
    const portNumber = event.notification?.data?.port_number || "";
    event.notification.close();

    event.waitUntil((async () => {
        const windowClients = await clients.matchAll({ includeUncontrolled: true, type: "window" });
        const absoluteTarget = (() => {
            try {
                const url = new URL(targetLink, self.location.origin);
                const isRootTarget = url.pathname === "/" || url.pathname === "";
                if (isRootTarget) {
                    return new URL(`/v2/${portNumber ? `?port=${encodeURIComponent(portNumber)}` : ""}`, self.location.origin).href;
                }
                if (url.pathname.startsWith("/v2")) {
                    if (portNumber) {
                        url.searchParams.set("port", portNumber);
                    }
                    return url.href;
                }
                return new URL(`/v2/${portNumber ? `?port=${encodeURIComponent(portNumber)}` : ""}`, self.location.origin).href;
            } catch {
                return new URL(`/v2/${portNumber ? `?port=${encodeURIComponent(portNumber)}` : ""}`, self.location.origin).href;
            }
        })();
        const prefersV2 = windowClients.find((client) => {
            try {
                return new URL(client.url).pathname.startsWith("/v2");
            } catch {
                return false;
            }
        });

        const isRootTarget = (() => {
            try {
                const url = new URL(targetLink, self.location.origin);
                return url.pathname === "/" || url.pathname === "";
            } catch {
                return targetLink === "/";
            }
        })();

        if (prefersV2 && "focus" in prefersV2) {
            if ("navigate" in prefersV2 && prefersV2.url !== absoluteTarget) {
                await prefersV2.navigate(absoluteTarget);
            }
            return prefersV2.focus();
        }

        for (const client of windowClients) {
            if (client.url === absoluteTarget && "focus" in client) {
                return client.focus();
            }
        }

        if (clients.openWindow) {
            return clients.openWindow(absoluteTarget);
        }
    })());
});
