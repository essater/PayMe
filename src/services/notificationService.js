// src/services/notificationService.js

import * as Notifications from 'expo-notifications';
import { auth, firestore } from './firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList:   true,
    shouldPlaySound:  false,
    shouldSetBadge:   false,
  }),
});

function maskIban(iban) {
  const compact = iban.replace(/\s+/g, '');
  return `${compact.slice(0,4)}****${compact.slice(-4)}`;
}

export function subscribeToIncomingTransactions() {
  // 1. Lokal bildirim iznini iste
  Notifications.requestPermissionsAsync();

  const uid = auth.currentUser?.uid;
  if (!uid) return () => {};

  // 2. Abonelik başlangıç zamanı
  const subscribeTime = Date.now();

  const txnsRef  = collection(firestore, 'users', uid, 'transactions');
  const notifCol = collection(firestore, 'users', uid, 'notifications');
  const q        = query(txnsRef, orderBy('date', 'desc'));

  let initialized = false;  // artık gerek yok
  // let initialized = false;

  const unsubscribe = onSnapshot(q, snapshot => {
   if (!initialized) {
     initialized = true;
     return;
   }

    snapshot.docChanges().forEach(async change => {
      if (change.type !== 'added') return;

      const data = change.doc.data();

     // 3. Sadece subscribeTime sonrası yaratılanlara izin ver
     const ts = data.date?.toMillis?.() ?? 0;
     if (ts < subscribeTime) return;

      const {
        direction,
        date,
        senderName,
        recipientName,
        senderAccountId,
        recipientAccountId,
        amount: rawAmount
      } = data;

      const isOutgoing = direction === 'out';
      const dt   = date.toDate();
      const dateStr = dt.toLocaleDateString('tr-TR');
      const timeStr = dt.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const acctId    = isOutgoing ? senderAccountId    : recipientAccountId;
      const acctShort = acctId.replace(/\s+/g, '').slice(-4);

      const counterpartyName = isOutgoing ? recipientName : senderName;
      const counterpartyIban = maskIban(isOutgoing ? recipientAccountId : senderAccountId);

      const amount = Math.abs(rawAmount).toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      const title = isOutgoing
        ? 'Hesabınızdan para gönderildi'
        : 'Hesabınıza para geldi';

      const body = isOutgoing
        ? `${dateStr} saat ${timeStr}'de ${acctShort} nolu hesabınızdan FAST ile ` +
          `${counterpartyName} ${counterpartyIban} hesabına ${amount} TL gönderilmiştir ${change.doc.id}`
        : `${dateStr} saat ${timeStr}'de ${acctShort} nolu hesabınıza FAST ile ` +
          `${counterpartyName} ${counterpartyIban} hesabından ${amount} TL gönderilmiştir ${change.doc.id}`;

      // (A) Lokal bildirim
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data: { transactionId: change.doc.id } },
        trigger: null
      });

      // (B) Firestore’a tekil kaydet
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
