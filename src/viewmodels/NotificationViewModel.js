import {
  subscribeToNotifications,
  subscribeToIncomingTransactions,
  subscribeToFriendRequests,
  subscribeToMoneyRequests
} from '../services/notificationService';

export const NotificationViewModel = {
  init() {
    // Hepsini başlat
    this._unsubIncoming = subscribeToIncomingTransactions();
    this._unsubFriend = subscribeToFriendRequests();
    this._unsubMoney = subscribeToMoneyRequests();
    this._unsubNotif = subscribeToNotifications();
  },

  cleanup() {
    // Hepsini durdur
    if (this._unsubIncoming) this._unsubIncoming();
    if (this._unsubFriend) this._unsubFriend();
    if (this._unsubMoney) this._unsubMoney();
    if (this._unsubNotif) this._unsubNotif();
  }
};
