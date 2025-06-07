import { firestore, auth } from '../services/firebase';
import { doc, updateDoc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

export const PaymentViewModel = {
  async processPayment({ posIban, amount, description }) {
    const user = auth.currentUser;
    if (!user) throw new Error('Kullanıcı giriş yapmamış.');

    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error('Kullanıcı verisi bulunamadı.');

    const userData = userDoc.data();

    if (userData.card.balance < amount) throw new Error('Yetersiz bakiye.');

    // Pos hesabı sorgusu
    const q = query(collection(firestore, 'users'), where('iban', '==', posIban));
    const posUserSnapshot = await getDocs(q);

    if (posUserSnapshot.empty) throw new Error('Pos hesabı bulunamadı.');

    const posUserDoc = posUserSnapshot.docs[0];
    const posUserRef = posUserDoc.ref;
    const posUserData = posUserDoc.data();

    // Bakiye güncelleme
    await updateDoc(userRef, {
      'card.balance': userData.card.balance - amount
    });
    await updateDoc(posUserRef, {
      'card.balance': (posUserData.card.balance || 0) + amount
    });

    // İşlem kayıtları
    const txnData = {
      senderAccountId: userData.iban,
      receiverAccountId: posIban,
      amount,
      date: serverTimestamp(),
      reason: description || 'QR ile ödeme',
      note: ''
    };

    await addDoc(collection(userRef, 'transactions'), txnData);
    await addDoc(collection(posUserRef, 'transactions'), txnData);

    return true;
  }
};
