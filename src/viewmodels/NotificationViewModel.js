// src/viewmodels/NotificationViewModel.js
import { subscribeToNotifications } from '../services/notificationService';

export const NotificationViewModel = {
  init() {
    this._unsub = subscribeToNotifications();
  },
  cleanup() {
    if (this._unsub) this._unsub();
  }
};
