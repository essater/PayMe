// src/views/NotificationsScreen.js

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '../services/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc
} from 'firebase/firestore';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const uid = auth.currentUser.uid;
    const notifRef = collection(firestore, 'users', uid, 'notifications');
    const q = query(notifRef, orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const deleteNotification = async (id) => {
    try {
      const uid = auth.currentUser.uid;
      await deleteDoc(doc(firestore, 'users', uid, 'notifications', id));
    } catch (e) {
      Alert.alert('Hata', 'Bildirim silinirken bir sorun oluştu.');
    }
  };

  const clearAll = () => {
    Alert.alert(
      'Tümünü Temizle',
      'Bütün bildirimleri silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: async () => {
            const uid = auth.currentUser.uid;
            await Promise.all(
              notifications.map(n =>
                deleteDoc(doc(firestore, 'users', uid, 'notifications', n.id))
              )
            );
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <TouchableOpacity onPress={() => deleteNotification(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#d32f2f" />
        </TouchableOpacity>
      </View>
      <Text style={styles.body}>{item.body}</Text>
      <Text style={styles.time}>
        {item.timestamp?.toDate().toLocaleString('tr-TR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bildirimler</Text>
        <TouchableOpacity onPress={clearAll}>
          <Text style={styles.clearAll}>Tümünü Temizle</Text>
        </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    justifyContent: 'space-between'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  clearAll: { color: '#d32f2f', fontSize: 14 },

  list: { padding: 16 },
  separator: { height: 8 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#666' },

  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: { fontSize: 16, fontWeight: '600', color: '#333' },
  body: { fontSize: 14, color: '#555', marginTop: 4 },
  time: { fontSize: 12, color: '#999', marginTop: 6, textAlign: 'right' }
});
