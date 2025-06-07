// src/viewmodels/AuthViewModel.js

import { auth, firestore } from '../services/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import CardModel from '../models/CardModel';

import {
  generateRandomCardNumber,
  generateRandomCvv,
  generateExpiryDateFromNowPlusFiveYears
} from '../utils/cardGenerators';

import { generateRandomTurkishIban } from '../utils/ibanGenerator';

import {
  isValidEmail,
  isStrongPassword,
  isNotEmpty,
  isValidName,
  isValidBirthDate
} from '../utils/validators';

export const AuthViewModel = {
  async signUpUser({ name, surname, email, birth, password }) {
    // Giriş doğrulamaları
    if (!isValidName(name)) {
      return { success: false, error: { message: 'Geçerli bir ad girin.' } };
    }

    if (!isValidName(surname)) {
      return { success: false, error: { message: 'Geçerli bir soyad girin.' } };
    }

    if (!isValidEmail(email)) {
      return { success: false, error: { message: 'Geçerli bir e-posta adresi girin.' } };
    }

    if (!isValidBirthDate(birth)) {
      return { success: false, error: { message: 'Geçerli bir doğum tarihi girin. (GG.AA.YYYY)' } };
    }

    if (!isStrongPassword(password)) {
      return {
        success: false,
        error: {
          message:
            'Parola en az 8 karakter olmalı, büyük/küçük harf, rakam ve özel karakter içermelidir.'
        }
      };
    }

   try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const uid = user.uid;
      await sendEmailVerification(user);

      const cardData = new CardModel({
        cardNumber: generateRandomCardNumber(),
        expiryMonth: generateExpiryDateFromNowPlusFiveYears().month,
        expiryYear: generateExpiryDateFromNowPlusFiveYears().year,
        cvv: generateRandomCvv(),
        balance: 0
      });


    const ibanObj = generateRandomTurkishIban();
      const rawIban = ibanObj.raw;

      await setDoc(doc(firestore, 'users', uid), {
        name,
        surname,
        email,
        birth,
        card: {
          cardNumber: cardData.cardNumber,
          expiryMonth: cardData.expiryMonth,
          expiryYear: cardData.expiryYear,
          cvv: cardData.cvv,
          balance: cardData.balance
        },
        iban: rawIban,
        qrData: rawIban
      });

      return { success: true, userUid: uid };
    } catch (error) {
      console.error('❌ AuthViewModel.signUpUser Hatası:', error);
      return { success: false, error };
    }
  },

  async loginUser(email, password) {
    if (!isValidEmail(email)) {
      return { success: false, error: { message: 'Geçerli bir e-posta adresi girin.' } };
    }

    if (!isNotEmpty(password)) {
      return { success: false, error: { message: 'Şifre boş olamaz.' } };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      return {
        success: true,
        emailVerified: user.emailVerified
      };
    } catch (error) {
      return { success: false, error };
    }
  },

  async getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', uid));
      if (userDoc.exists()) {
        return { success: true, data: userDoc.data() };
      } else {
        return { success: false, error: 'Kullanıcı bulunamadı' };
      }
    } catch (error) {
      return { success: false, error };
    }
  }
};
