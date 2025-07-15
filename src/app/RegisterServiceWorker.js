
const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('ServiceWorker зарегистрирован:', registration.scope);
          
          if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            console.log('Статус разрешения:', permission);
          }
        } catch (error) {
          console.error('Ошибка регистрации:', error);
        }
    }
};

export default registerServiceWorker