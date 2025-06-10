// src/services/notificationService.js

import * as Notifications from 'expo-notifications';
import { auth, firestore } from './firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';

// Lokal bildirim handler’ı
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList:   true,
    shouldPlaySound:  false,
    shouldSetBadge:   false,
  }),
});

// IBAN maskelerken kullanılıyor
function maskIban(iban) {
  const compact = iban.replace(/\s+/g, '');
  return `${compact.slice(0,4)}****${compact.slice(-4)}`;
}

/**
 * 1) Firestore’dan yeni işlemleri dinler,
 * 2) Yalnızca Firestore’a “transfer” bildirimi yazar.
 * (Banner scheduling, subscribeToNotifications ile yapılacak.)
 */
export function subscribeToIncomingTransactions() {
  Notifications.requestPermissionsAsync();
  const uid = auth.currentUser?.uid;
  if (!uid) return () => {};

  const subscribeTime = Date.now();
  const txnsRef      = collection(firestore, 'users', uid, 'transactions');
  const notifCol     = collection(firestore, 'users', uid, 'notifications');
  const q            = query(txnsRef, orderBy('date', 'desc'));

  let initialized = false;
  const unsubscribe = onSnapshot(q, snapshot => {
    if (!initialized) { initialized = true; return; }
    snapshot.docChanges().forEach(async change => {
      if (change.type !== 'added') return;
      const data = change.doc.data();
      const ts   = data.date?.toMillis?.() ?? 0;
      if (ts < subscribeTime) return;

      // Firestore'a sadece bildirim kaydet
      const {
        direction, date,
        senderName, recipientName,
        senderAccountId, recipientAccountId,
        amount: rawAmount
      } = data;

      const isOutgoing = direction === 'out';
      const dt         = date.toDate();
      const dateStr    = dt.toLocaleDateString('tr-TR');
      const timeStr    = dt.toLocaleTimeString('tr-TR', {
        hour:   '2-digit',
        minute: '2-digit'
      });

      const acctId      = isOutgoing ? senderAccountId : recipientAccountId;
      const acctShort   = acctId.replace(/\s+/g, '').slice(-4);
      const counterName = isOutgoing ? recipientName : senderName;
      const counterIban = maskIban(isOutgoing ? recipientAccountId : senderAccountId);
      const amount      = Math.abs(rawAmount).toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      const title = isOutgoing
        ? 'Hesabınızdan para gönderildi'
        : 'Hesabınıza para geldi';
      const body = isOutgoing
        ? `${dateStr} saat ${timeStr}'de ${acctShort} nolu hesabınızdan FAST ile ${counterName} ${counterIban} hesabına ${amount} TL gönderildi.`
        : `${dateStr} saat ${timeStr}'de ${acctShort} nolu hesabınıza FAST ile ${counterName} ${counterIban} hesabından ${amount} TL geldi.`;

      const notifDoc = doc(notifCol, change.doc.id);
      await setDoc(notifDoc, {
        title,
        body,
        timestamp: serverTimestamp(),
        read: false,
        transactionId: change.doc.id,
        type: 'transfer'
      });
    });
  });

  return unsubscribe;
}

/**
 * Firestore’daki “friend_request” tipli bildirimleri dinler,
 * (Banner scheduling, subscribeToNotifications ile yapılacak.)
 */
export function subscribeToFriendRequests() {
  Notifications.requestPermissionsAsync();
  const uid = auth.currentUser?.uid;
  if (!uid) return () => {};

  const notifCol = collection(firestore, 'users', uid, 'notifications');
  const q        = query(notifCol, where('type', '==', 'friend_request'), orderBy('timestamp', 'desc'));

  let initialized = false;
  const unsubscribe = onSnapshot(q, snapshot => {
    if (!initialized) { initialized = true; return; }
    // Sadece Firestore’daki notification koleksiyonu güncellensin
    // Lokal banner, subscribeToNotifications ile gösterilecek
  });

  return unsubscribe;
}

/**
 * Firestore’daki “money_request” tipli bildirimleri dinler,
 * (Banner scheduling, subscribeToNotifications ile yapılacak.)
 */
export function subscribeToMoneyRequests() {
  Notifications.requestPermissionsAsync();
  const uid = auth.currentUser?.uid;
  if (!uid) return () => {};

  const notifCol = collection(firestore, 'users', uid, 'notifications');
  const q        = query(notifCol, where('type', '==', 'money_request'), orderBy('timestamp', 'desc'));

  let initialized = false;
  const unsubscribe = onSnapshot(q, snapshot => {
    if (!initialized) { initialized = true; return; }
    // Lokaller kaldırıldı; subscribeToNotifications ile tek banner
  });

  return unsubscribe;
}

/**
 * Tüm tipleri tek bir abone altında birleştirmek için:
 */
export function subscribeToNotifications() {
  Notifications.requestPermissionsAsync();
  const uid = auth.currentUser?.uid;
  if (!uid) return () => {};

  const notifCol = collection(firestore, 'users', uid, 'notifications');
  const q        = query(notifCol, orderBy('timestamp', 'desc'));

  let initialized = false;
  const unsubscribe = onSnapshot(q, snapshot => {
    if (!initialized) { initialized = true; return; }
    snapshot.docChanges().forEach(async change => {
      if (change.type !== 'added') return;
      const data = change.doc.data();
      if (!['transfer','friend_request','money_request'].includes(data.type)) return;
      await Notifications.scheduleNotificationAsync({
        content: {
          title:     data.title,
          body:      data.body,
          data,
          channelId: 'default',
          sound:     false
        },
        trigger: null
      });
    });
  });

  return unsubscribe;
}
