
const showNotification = (title, body) => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title: title,
        options: {
          body: body,
          icon: '/icon-192x192.png',
          vibrate: [200, 100, 200]
        }
      });
    }
};

export default showNotification