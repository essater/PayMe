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
  async startTransfer({ senderIban, recipientIban, recipientName, amount, reason, note }) {
    try {
      const usersRef = collection(firestore, 'users');

      // 1) Alıcıyı bul
      const recipientQ = query(usersRef, where('iban', '==', recipientIban));
      const recipientSnapshot = await getDocs(recipientQ);
      if (recipientSnapshot.empty) {
        return { success: false, error: new Error('Alıcı bulunamadı. Lütfen geçerli bir IBAN girin.') };
      }
      const recipientUid = recipientSnapshot.docs[0].id;

      // 2) Göndereni bul
      const senderQ = query(usersRef, where('iban', '==', senderIban));
      const senderSnapshot = await getDocs(senderQ);
      if (senderSnapshot.empty) {
        return { success: false, error: new Error('Gönderen hesabı hatalı. Lütfen tekrar giriş yapın.') };
      }
      const senderUid = senderSnapshot.docs[0].id;

      // 3) Transaction ile bakiye güncelleme ve kayıt ekleme
      await runTransaction(firestore, async (tx) => {
        const senderRef = doc(firestore, 'users', senderUid);
        const senderSnap = await tx.get(senderRef);
        if (!senderSnap.exists()) throw new Error('Gönderen kullanıcı verisi bulunamadı.');
        const senderData = senderSnap.data();
        const senderBalance = senderData.card?.balance || 0;
        if (senderBalance < amount) throw new Error('Yetersiz bakiye.');

        const recipientRef = doc(firestore, 'users', recipientUid);
        const recipientSnap = await tx.get(recipientRef);
        if (!recipientSnap.exists()) throw new Error('Alıcı kullanıcı verisi bulunamadı.');
        const recipientData = recipientSnap.data();
        const recipientBalance = recipientData.card?.balance || 0;

        // Yeni bakiyeler
        const newSenderBalance = senderBalance - amount;
        const newRecipientBalance = recipientBalance + amount;

        // Aynı timestamp'i hem date hem createdAt için tut
        const ts = serverTimestamp();

        // Ortak transfer verisi
        const baseTransfer = {
          senderAccountId: senderIban,
          senderName: `${senderData.name} ${senderData.surname}`,
          recipientAccountId: recipientIban,
          recipientName: recipientName || `${recipientData.name} ${recipientData.surname}`,
          reason: reason || '',
          note: note || '',
          date: ts,
          createdAt: ts,
          participants: [senderIban, recipientIban],
          type: 'Transfer'
        };

        // 4) Bakiyeleri güncelle
        tx.update(senderRef, { 'card.balance': newSenderBalance });
        tx.update(recipientRef, { 'card.balance': newRecipientBalance });

        // 5) Global transfer kaydı (pozitif tutar)
        tx.set(
          doc(collection(firestore, 'transfers')),
          { ...baseTransfer, amount }
        );

        // 6) Gönderenin işlemlerine kaydet (giden)
        tx.set(
          doc(collection(firestore, 'users', senderUid, 'transactions')),
          { ...baseTransfer, amount: -amount, counterparty: recipientIban, direction: 'out' }
        );

        // 7) Alıcının işlemlerine kaydet (gelen)
        tx.set(
          doc(collection(firestore, 'users', recipientUid, 'transactions')),
          { ...baseTransfer, amount: amount, counterparty: senderIban, direction: 'in' }
        );
      });

      return { success: true };
    } catch (error) {
      console.error('❌ TransferViewModel.startTransfer Hatası:', error);
      return { success: false, error };
    }
  }
};
