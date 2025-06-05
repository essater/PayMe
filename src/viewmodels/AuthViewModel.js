// src/viewmodels/AuthViewModel.js

import { auth, firestore } from '../services/firebase';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import CardModel from '../models/CardModel';

import {
  generateRandomCardNumber,
  generateRandomCvv,
  generateExpiryDateFromNowPlusFiveYears
} from '../utils/cardGenerators';
// ─── IBAN üretici fonksiyonunu import edelim ───
import { generateRandomTurkishIban } from '../utils/ibanGenerator';

export const AuthViewModel = {
  async signUpUser({ name, surname, email, birth, password }) {
    try {
      // 1) Auth’a kullanıcı ekle
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const uid  = user.uid;

      // 2) E-posta doğrulama bağlantısı
      await sendEmailVerification(user);

      // 3) Kart bilgisi üret
      const cardNumberInfo = generateRandomCardNumber();
      const expiryInfo     = generateExpiryDateFromNowPlusFiveYears();
      const cvvInfo        = generateRandomCvv();
      const cardData       = new CardModel({
        cardNumber:  cardNumberInfo,
        expiryMonth: expiryInfo.month,
        expiryYear:  expiryInfo.year,
        cvv:         cvvInfo,
        balance:     0
      });

      // 4) Rastgele TR IBAN üretiyoruz: artık { raw, formatted } objesi döner
      const ibanObj = generateRandomTurkishIban();
      // Raw IBAN (boşluksuz) string’ini al
      const rawIban = ibanObj.raw;

      // 5) Firestore’a yaz (yalnızca raw IBAN saklanacak)
      await setDoc(doc(firestore, "users", uid), {
        name:    name,
        surname: surname,
        email:   email,
        birth:   birth,
        card: {
          cardNumber:  cardData.cardNumber,
          expiryMonth: cardData.expiryMonth,
          expiryYear:  cardData.expiryYear,
          cvv:         cardData.cvv,
          balance:     cardData.balance
        },
        iban: rawIban   // ← Burada sadece raw string’i kaydediyoruz
      });

      return { success: true, userUid: uid };
    } catch (error) {
      console.error("❌ AuthViewModel.signUpUser Hatası:", error);
      return { success: false, error };
    }
  },

  async getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(firestore, "users", uid));
      if (userDoc.exists()) {
        return { success: true, data: userDoc.data() };
      } else {
        return { success: false, error: "Kullanıcı bulunamadı" };
      }
    } catch (error) {
      return { success: false, error };
    }
  }
};
