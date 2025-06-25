import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '../services/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
  getDocs,
  writeBatch,
  where
} from 'firebase/firestore';
import { FriendRequestViewModel } from '../viewmodels/FriendRequestViewModel';
import { TransferViewModel } from '../viewmodels/TransferViewModel';
import { AuthViewModel } from '../viewmodels/AuthViewModel';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const uid = auth.currentUser.uid;
    const notifRef = collection(firestore, 'users', uid, 'notifications');
    const q = query(notifRef, orderBy('timestamp', 'desc'));
    return onSnapshot(q, snap =>
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const deleteNotification = async id => {
    const uid = auth.currentUser.uid;
    await deleteDoc(doc(firestore, 'users', uid, 'notifications', id));
  };

  const markAllAsRead = async () => {
    const uid = auth.currentUser.uid;
    const notifRef = collection(firestore, 'users', uid, 'notifications');
    const q = query(notifRef, where('read', '==', false));
    const snap = await getDocs(q);
    if (snap.empty) return;
    const batch = writeBatch(firestore);
    snap.docs.forEach(d =>
      batch.update(doc(firestore, 'users', uid, 'notifications', d.id), { read: true })
    );
    await batch.commit();
  };

  const handleAcceptFriend = note => {
    FriendRequestViewModel.acceptRequest(note.requestFrom)
      .then(() => deleteNotification(note.id));
  };

  const handleRejectFriend = note => {
    FriendRequestViewModel.rejectRequest(note.requestFrom)
      .then(() => deleteNotification(note.id));
  };

  const handleAcceptMoney = async note => {
    const meUid = auth.currentUser.uid;
    const meRes = await AuthViewModel.getUserData(meUid);
    if (!meRes.success) {
      deleteNotification(note.id);
      return;
    }
    const senderIban = meRes.data.iban;
    await TransferViewModel.startTransfer({
      senderIban,
      recipientIban: note.requestFromIban,
      recipientName: note.requestFromName,
      amount: note.amount,
      reason: 'Para İsteğe Cevap',
      note: note.note || ''
    });
    await deleteNotification(note.id);
  };

  const handleRejectMoney = async note => {
    const me = auth.currentUser;
    const notifId = `money_req_rej_${me.uid}_${Date.now()}`;
    await setDoc(
      doc(firestore, 'users', note.requestFrom, 'notifications', notifId),
      {
        title: 'Para İsteği Reddedildi',
        body: `${note.requestFromName}, talebiniz reddedildi.`,
        type: 'money_request_rejected',
        timestamp: serverTimestamp(),
        read: false
      }
    );
    await deleteNotification(note.id);
  };

  const clearAll = () => {
    const uid = auth.currentUser.uid;
    notifications.forEach(n =>
      deleteDoc(doc(firestore, 'users', uid, 'notifications', n.id))
    );
  };

  const renderItem = ({ item }) => {
    const cardColor = item.read ? '#f2f4f8' : '#ffffff';
    return (
      <View style={[styles.card, { backgroundColor: cardColor }]}>  
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.title}</Text>
          <TouchableOpacity onPress={() => deleteNotification(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#d32f2f" />
          </TouchableOpacity>
        </View>
        <Text style={styles.body}>{item.body}</Text>
        {item.type !== 'transfer' && (
          <View style={styles.buttons}>
            {item.type === 'friend_request' && (
              <>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptFriend(item)}>
                  <Text style={styles.acceptText}>Kabul</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRejectFriend(item)}>
                  <Text style={styles.rejectText}>Reddet</Text>
                </TouchableOpacity>
              </>
            )}
            {item.type === 'money_request' && (
              <>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptMoney(item)}>
                  <Text style={styles.acceptText}>Gönder</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRejectMoney(item)}>
                  <Text style={styles.rejectText}>Reddet</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
        <Text style={styles.time}>{item.timestamp?.toDate().toLocaleString('tr-TR')}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#3d5a80" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bildirimler</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={markAllAsRead} style={styles.headerBtn}>
            <Ionicons name="checkmark-done-outline" size={24} color="#3d5a80" />
          </TouchableOpacity>
          <TouchableOpacity onPress={clearAll} style={styles.headerBtn}>
            <Text style={styles.clearAll}>Temizle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Bildirim yok.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafd' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eaf0f6', padding: 16, borderBottomColor: '#ddd', borderBottomWidth: 1 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#3d5a80' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerBtn: { marginLeft: 16 },
  clearAll: { color: '#d32f2f', fontSize: 14 },
  list: { padding: 16 },
  separator: { height: 10 },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#666', fontSize: 16 },
  card: { borderRadius: 10, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600', color: '#333' },
  body: { fontSize: 14, color: '#555', marginTop: 6 },
  time: { fontSize: 12, color: '#999', marginTop: 10, textAlign: 'right' },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  acceptBtn: { backgroundColor: '#4caf50', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, marginRight: 8 },
  acceptText: { color: '#fff', fontWeight: '600' },
  rejectBtn: { backgroundColor: '#f44336', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  rejectText: { color: '#fff', fontWeight: '600' }
});
