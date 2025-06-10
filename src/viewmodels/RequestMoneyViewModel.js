// src/viewmodels/RequestMoneyViewModel.js

import { firestore, auth } from '../services/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';

export const RequestMoneyViewModel = {
 
  async sendRequest({ recipientIban, amount, note }) {
    // 1) Alıcıyı IBAN ile bul
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('iban', '==', recipientIban));
    const snap = await getDocs(q);
    if (snap.empty) {
      throw new Error('Alıcı bulunamadı. Lütfen geçerli bir IBAN girin.');
    }
    const recipientUid = snap.docs[0].id;

    // 2) Gönderen (current user) verisini al
    const me = auth.currentUser;
    const meSnap = await getDoc(doc(firestore, 'users', me.uid));
    const meData = meSnap.data();

    // 3) Bildirimi ekle
    await setDoc(
      doc(
        firestore,
        'users',
        recipientUid,
        'notifications',
        `money_req_${me.uid}_${Date.now()}`
      ),
      {
        title:           'Para İsteği',
        body:            `${meData.name} ${meData.surname} sizden ${amount} TL talep etti.${note ? `\nAçıklama: ${note}` : ''}`,
        type:            'money_request',
        requestFrom:     me.uid,
        requestFromName: `${meData.name} ${meData.surname}`,
        requestFromIban: meData.iban,
        amount,
        note,
        timestamp:       serverTimestamp(),
        read:            false
      }
    );

    return true;
  }
};
