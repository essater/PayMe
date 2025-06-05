// src/viewmodels/TransferViewModel.js

import { firestore } from '../services/firebase';
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';

export const TransferViewModel = {
  async startTransfer({
    senderIban,
    recipientIban,
    recipientName,
    amount,
    reason,
    note
  }) {
    try {
      const usersRef = collection(firestore, 'users');

      const q = query(usersRef, where('iban', '==', recipientIban));
      const recipientSnapshot = await getDocs(q);
      if (recipientSnapshot.empty) {
        return {
          success: false,
          error: new Error('Alıcı bulunamadı. Lütfen geçerli bir IBAN girin.')
        };
      }
      const recipientDoc = recipientSnapshot.docs[0];
      const recipientUid = recipientDoc.id;

      const q2 = query(usersRef, where('iban', '==', senderIban));
      const senderSnapshot = await getDocs(q2);
      if (senderSnapshot.empty) {
        return {
          success: false,
          error: new Error('Gönderen hesabı hatalı. Lütfen tekrar giriş yapın.')
        };
      }
      const senderDoc = senderSnapshot.docs[0];
      const senderUid = senderDoc.id;

      await runTransaction(firestore, async (tx) => {
        const senderUserRef = doc(firestore, 'users', senderUid);
        const senderUserSnap = await tx.get(senderUserRef);
        if (!senderUserSnap.exists()) throw new Error('Gönderen kullanıcı verisi bulunamadı.');
        const senderData = senderUserSnap.data();
        const senderBalance = senderData.card?.balance;
        if (senderBalance < amount) throw new Error('Yetersiz bakiye.');

        const recipientUserRef = doc(firestore, 'users', recipientUid);
        const recipientUserSnap = await tx.get(recipientUserRef);
        if (!recipientUserSnap.exists()) throw new Error('Alıcı kullanıcı verisi bulunamadı.');
        const recipientData = recipientUserSnap.data();
        const recipientBalance = recipientData.card?.balance;

        const newSenderBalance = senderBalance - amount;
        const newRecipientBalance = recipientBalance + amount;

        const transferData = {
          senderAccountId: senderIban,
          senderName: `${senderData.name} ${senderData.surname}`,
          recipientAccountId: recipientIban,
          recipientName: recipientName || `${recipientData.name} ${recipientData.surname}`,
          amount,
          reason: reason || '',
          note: note || '',
          date: serverTimestamp(),
          type: 'Transfer'
        };

        tx.update(senderUserRef, { 'card.balance': newSenderBalance });
        tx.update(recipientUserRef, { 'card.balance': newRecipientBalance });

        tx.set(doc(collection(firestore, 'transfers')), transferData);
        tx.set(doc(collection(firestore, 'users', senderUid, 'transactions')), transferData);
        tx.set(doc(collection(firestore, 'users', recipientUid, 'transactions')), transferData);
      });

      return { success: true };
    } catch (error) {
      console.error('❌ TransferViewModel.startTransfer Hatası:', error);
      return { success: false, error };
    }
  }
};
