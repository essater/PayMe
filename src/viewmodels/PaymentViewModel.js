// src/viewmodels/PaymentViewModel.js

import { firestore, auth } from '../services/firebase';
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

export const PaymentViewModel = {
  async processPayment({ posIban, amount, description }) {
    const user = auth.currentUser;
    if (!user) throw new Error('Kullanıcı giriş yapmamış.');

    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error('Kullanıcı verisi bulunamadı.');

    const userData = userSnap.data();
    const currentBalance = userData.card?.balance || 0;
    if (currentBalance < amount) throw new Error('Yetersiz bakiye.');

    // POS hesabını bul
    const q = query(
      collection(firestore, 'users'),
      where('iban', '==', posIban)
    );
    const posSnapshot = await getDocs(q);
    if (posSnapshot.empty) throw new Error('Pos hesabı bulunamadı.');

    const posUserDoc = posSnapshot.docs[0];
    const posUserRef = posUserDoc.ref;
    const posData = posUserDoc.data();
    const posBalance = posData.card?.balance || 0;

    // Aynı timestamp'i hem date hem createdAt için tut
    const ts = serverTimestamp();

    // Bakiyeleri güncelle
    await updateDoc(userRef, {
      'card.balance': currentBalance - amount
    });
    await updateDoc(posUserRef, {
      'card.balance': posBalance + amount
    });

    // Ortak transaction verisi (ekstra alanlar eklendi)
    const baseTxn = {
      senderAccountId: userData.iban,
      receiverAccountId: posIban,
      reason: description || 'QR ile ödeme',
      note: '',
      date: ts,
      createdAt: ts,
      participants: [userData.iban, posIban],
      type: 'Payment'
    };

    // 1) Gönderenin transactions alt-koleksiyonu (giden)
    await addDoc(
      collection(userRef, 'transactions'),
      {
        ...baseTxn,
        amount: -amount,
        counterparty: posIban,
        direction: 'out'
      }
    );

    // 2) POS kullanıcısının transactions alt-koleksiyonu (gelen)
    await addDoc(
      collection(posUserRef, 'transactions'),
      {
        ...baseTxn,
        amount: amount,
        counterparty: userData.iban,
        direction: 'in'
      }
    );

    return true;
  }
};
