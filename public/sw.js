self.addEventListener('push', event => {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/assets/images/logo.png', // You can add a logo.png to assets/images
        data: { time: data.time }, // Store time here
        actions: data.actions 
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const time = event.notification.data.time;

    if (event.action === 'yes') {
        // When user clicks YES, open the dashboard with instruction to record THIS specific meal
        event.waitUntil(clients.openWindow(`/dashboard.html?action=record&time=${time}`));
    } else if (event.action === 'no') {
    // When user clicks NO, open the dashboard with instruction to ask for a reason
    event.waitUntil(clients.openWindow(`/dashboard.html?action=askReason&time=${time}`));
} else {
    // If they click the notification body, open dashboard normally
    event.waitUntil(clients.openWindow('/dashboard.html'));
}
});