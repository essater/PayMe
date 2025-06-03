// src/viewmodels/AuthViewModel.js

import { auth, firestore } from '../services/firebase';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  reload
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import CardModel from '../models/CardModel';

import {
  generateRandomCardNumber,
  generateRandomCvv,
  generateExpiryDateFromNowPlusFiveYears
} from '../utils/cardGenerators';


export const AuthViewModel = {
  async signUpUser({ name, surname, email, birth, password }) {
    try {
      // ➊ Kullanıcıyı Auth’a ekle
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const uid = user.uid;

      // ➋ E-posta doğrulama
      await sendEmailVerification(user);

      // ➌ Kullanıcı bilgilerini hazırla
      const userData = { name, surname, email, birth };

      // ➍ Kart bilgileri üretimi (tam 5 yıl sonrası expiry)
      const cardNumberInfo = generateRandomCardNumber();                     // 16 haneli kart numarası
      const expiryInfo     = generateExpiryDateFromNowPlusFiveYears();       // 5 yıl sonrası
      const cvvInfo        = generateRandomCvv();                            // 3 haneli CVV

      const cardData = {
        cardNumber:  cardNumberInfo,
        expiryMonth: expiryInfo.month,
        expiryYear:  expiryInfo.year,
        cvv:         cvvInfo,
        balance:     0
      };

      // ➎ Firestore’a hem kullanıcı hem de kart bilgilerini kaydet
      await setDoc(doc(firestore, "users", uid), {
        ...userData,
        card: cardData
      });

      return { success: true, userUid: uid };
    } catch (error) {
      console.error("❌ AuthViewModel.signUpUser Hatası:", error);
      return { success: false, error };
    }
  },

  
  async signInUser({ email, password }) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error };
    }
  },

  async checkVerificationStatus() {
    try {
      await reload(auth.currentUser);
      const user = auth.currentUser;
      return { verified: user.emailVerified };
    } catch (error) {
      return { success: false, error };
    }
  },

  async signOutUser() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },

  onAuthStateChangedListener(callback) {
    return onAuthStateChanged(auth, callback);
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
