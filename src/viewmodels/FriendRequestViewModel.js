// src/viewmodels/FriendRequestViewModel.js

import { firestore, auth } from '../services/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';

export const FriendRequestViewModel = {
  /**
   * IBAN, ad-soyad ve takma ad alıp,
   * o IBAN’a kayıtlı kullanıcıya:
   *  • friendRequests alt-koleksiyonuna,
   *  • notifications alt-koleksiyonuna
   * yazar.
   */
  async sendRequest({ iban, name, nickname }) {
    // 1) Hedef kullanıcıyı IBAN ile bul
    const usersRef = collection(firestore, 'users');
    const q        = query(usersRef, where('iban', '==', iban));
    const snap     = await getDocs(q);
    if (snap.empty) {
      throw new Error('Bu IBAN’a kayıtlı kullanıcı bulunamadı.');
    }
    const targetUid = snap.docs[0].id;

    // 2) Gönderen (current user) verisini al
    const me     = auth.currentUser;
    const meSnap = await getDoc(doc(firestore, 'users', me.uid));
    const meData = meSnap.data();

    // 3) friendRequests alt-koleksiyonuna kayıt
    await setDoc(
      doc(firestore, 'users', targetUid, 'friendRequests', me.uid),
      {
        fromUid:        me.uid,
        fromName:       `${meData.name} ${meData.surname}`,
        fromIban:       meData.iban,
        friendName:     name,
        friendNickname: nickname,
        timestamp:      serverTimestamp()
      }
    );

    // 4) notifications alt-koleksiyonuna bildirim
    await setDoc(
      doc(
        firestore,
        'users',
        targetUid,
        'notifications',
        `friend_req_${me.uid}`
      ),
      {
        title:          'Yeni arkadaşlık isteği',
        body:           `${meData.name} ${meData.surname} sizi arkadaş eklemek istedi.`,
        friendName:     name,
        friendNickname: nickname,
        timestamp:      serverTimestamp(),
        read:           false,
        type:           'friend_request',
        requestFrom:    me.uid
      }
    );

    return true;
  },

  /**
   * Gelen arkadaşlık isteğini kabul et:
   * 1) İstek belgesinden verileri çek,
   * 2) İki kullanıcıyı birbirinin friends koleksiyonuna ekle,
   * 3) İstek yollayana kabul bildirimi yolla,
   * 4) İstek ve ilgili notification kaydını sil.
   */
  async acceptRequest(fromUid) {
    const me    = auth.currentUser;
    const myUid = me.uid;

    // 1) friendRequests belgesini oku
    const reqRef  = doc(firestore, 'users', myUid, 'friendRequests', fromUid);
    const reqSnap = await getDoc(reqRef);
    if (!reqSnap.exists()) {
      throw new Error('Arkadaşlık isteği bulunamadı.');
    }
    const {
      fromName,
      fromIban,
      friendName,
      friendNickname
    } = reqSnap.data();

    // 2) Me’nin IBAN’ını al
    const meSnap  = await getDoc(doc(firestore, 'users', myUid));
    const meData  = meSnap.data();
    const myIban  = meData.iban;

    // 3) friends alt-koleksiyonlarına kaydet
    await Promise.all([
      // A) Benim listeme, isteği atanı ekle
      setDoc(
        doc(firestore, 'users', myUid, 'friends', fromUid),
        {
          uid:      fromUid,
          name:     fromName,
          nickname: fromName.split(' ')[0],
          iban:     fromIban,
          since:    serverTimestamp()
        }
      ),
      // B) Gönderenin listesine, beni ekle
      setDoc(
        doc(firestore, 'users', fromUid, 'friends', myUid),
        {
          uid:      myUid,
          name:     friendName,
          nickname: friendNickname,
          iban:     myIban,
          since:    serverTimestamp()
        }
      )
    ]);

    // 4) Kabul bildirimini ekle
    await setDoc(
      doc(
        firestore,
        'users',
        fromUid,
        'notifications',
        `friend_accept_${myUid}`
      ),
      {
        title:     'Arkadaşlık onayı',
        body:      `${me.displayName || me.email} arkadaşlık isteğinizi kabul etti.`,
        timestamp: serverTimestamp(),
        read:      false,
        type:      'friend_accept'
      }
    );

    // 5) İstek ve ilgili notification belgesini sil
    await Promise.all([
      deleteDoc(reqRef),
      deleteDoc(
        doc(
          firestore,
          'users',
          myUid,
          'notifications',
          `friend_req_${fromUid}`
        )
      )
    ]);
  },

  async rejectRequest(fromUid) {
    const me    = auth.currentUser;
    const myUid = me.uid;

    await Promise.all([
      deleteDoc(
        doc(firestore, 'users', myUid, 'friendRequests', fromUid)
      ),
      deleteDoc(
        doc(
          firestore,
          'users',
          myUid,
          'notifications',
          `friend_req_${fromUid}`
        )
      )
    ]);
  }
};
