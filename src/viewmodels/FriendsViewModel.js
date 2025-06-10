// src/viewmodels/FriendsViewModel.js

import { firestore, auth } from '../services/firebase';
import {
  collection,
  query,
  onSnapshot,
  doc,
  deleteDoc,
 updateDoc
} from 'firebase/firestore';

export const FriendsViewModel = {
  /**
   * Kullanıcının arkadaş listesini dinler.
   * @param {function(Array)} onUpdate - Friends array’ini dönen callback.
   * @returns {function} unsubscribe
   */
  subscribeFriends(onUpdate) {
    const uid = auth.currentUser?.uid;
    if (!uid) return () => {};

    const friendsRef = collection(firestore, 'users', uid, 'friends');
    const q = query(friendsRef);
    const unsubscribe = onSnapshot(q, snapshot => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      onUpdate(list);
    });

    return unsubscribe;
  },

  /**
   * Bir arkadaşı siler.
   * @param {string} friendId
   * @returns {Promise}
   */
  removeFriend(friendId) {
    const uid = auth.currentUser?.uid;
    if (!uid) return Promise.reject();
    const friendDoc = doc(firestore, 'users', uid, 'friends', friendId);
    return deleteDoc(friendDoc);
  },

  /**
   * Bir arkadaşın bilgilerini günceller.
   * @param {string} friendId
   * @param {object} updates - Güncellenecek alanlar, örn: { nickname, name, iban }
   * @returns {Promise}
   */
  updateFriend(friendId, updates) {
    const uid = auth.currentUser?.uid;
    if (!uid) return Promise.reject(new Error('Kullanıcı bulunamadı'));
    const friendDoc = doc(firestore, 'users', uid, 'friends', friendId);
    return updateDoc(friendDoc, updates);
  }
};
