
import { LOGO_URL } from '../constants';

export const NotificationService = {
  requestPermission: async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return false;
    }

    if (Notification.permission === 'granted') return true;

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  },

  send: (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: LOGO_URL,
          tag: 'fms-alert',
          // Removed vibrate property as it is not supported in the standard NotificationOptions type definition
        });
      } catch (e) {
        console.error('Failed to fire notification', e);
      }
    }
  }
};
