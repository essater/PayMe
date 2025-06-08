// src/viewmodels/NotificationViewModel.js

import { subscribeToIncomingTransactions } from '../services/notificationService';

export const NotificationViewModel = {
  init() {
    // Firestore aboneliğini başlat ve fonksiyonu sakla
    this._unsub = subscribeToIncomingTransactions();
  },

  cleanup() {
    // Unsubscribe ile dinlemeyi durdur
    if (this._unsub) this._unsub();
  }
};