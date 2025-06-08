// src/views/HomeScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '../services/firebase';
import * as Clipboard from 'expo-clipboard';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { capitalizeTR } from '../utils/formatters';
import { NotificationViewModel } from '../viewmodels/NotificationViewModel';
import * as Notifications from 'expo-notifications';

export default function HomeScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [personalTxns, setPersonalTxns] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(true);

  // Bildirim token kaydı ve yanıt dinleyici
  useEffect(() => {
    // Başlat
    NotificationViewModel.init();

    // Bildirime tıklanınca Notifications ekranına yönlendir
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      navigation.navigate('Notifications');
    });

    return () => {
      // Temizle
      NotificationViewModel.cleanup();
      Notifications.removeNotificationSubscription(subscription);
    };
  }, []);

  // Kullanıcı verisini gerçek zamanlı dinle
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }
    const userRef = doc(firestore, 'users', currentUser.uid);
    const unsubUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        Alert.alert('Hata', 'Kullanıcı verisi bulunamadı.');
      }
      setLoadingUser(false);
    });
    return () => unsubUser();
  }, []);

  // Son işlemleri gerçek zamanlı dinle
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const txnRef = collection(firestore, 'users', uid, 'transactions');
    const q = query(txnRef, orderBy('date', 'desc'));
    const unsubTxns = onSnapshot(
      q,
      (snap) => {
        setPersonalTxns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoadingTxns(false);
      },
      () => setLoadingTxns(false)
    );
    return () => unsubTxns();
  }, []);

  if (loadingUser) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2c2c97" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.centered}>
        <Text>Kullanıcı verisi bulunamadı.</Text>
      </View>
    );
  }

  const { card, iban: rawIban, name } = userData;
  const formattedIban = rawIban.replace(/(.{4})/g, '$1 ').trim();
  const copyIban = async () => {
    await Clipboard.setStringAsync(rawIban);
    Alert.alert('Kopyalandı', 'IBAN panoya kopyalandı.');
  };

  // Render son işlemler kartı
  const renderTransferItem = ({ item }) => {
    const dateObj = item.date?.toDate ? item.date.toDate() : new Date(item.date);
    const formattedDate = dateObj.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const desc = (item.reason || '') + (item.note ? ' - ' + item.note : '');
    const isOutgoing = item.direction === 'out';
    const nameLine = isOutgoing ? item.recipientName : item.senderName;
    const ibanLine = isOutgoing ? item.recipientAccountId : item.senderAccountId;
    const sign = isOutgoing ? '-' : '+';
    const color = isOutgoing ? '#d32f2f' : '#388e3c';

    return (
      <View style={styles.transferCard}>
        <Text style={styles.counterpartyName}>{nameLine}</Text>
        <Text style={styles.counterpartyIban}>
          {ibanLine.replace(/(.{4})/g, '$1 ').trim()}
        </Text>
        <View style={styles.transferRow}>
          <Text style={styles.transferDescription}>{desc}</Text>
          <Text style={[styles.transferAmount, { color }]}>
            {sign}{Math.abs(item.amount).toFixed(2)} ₺
          </Text>
        </View>
        <Text style={styles.transferDate}>{formattedDate}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER: Hoş geldin + Bildirim İkonu */}
      <View style={styles.headerContainer}>
        <Text style={styles.welcome}>Hoş geldin, {capitalizeTR(name)}</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#2c2c97" />
        </TouchableOpacity>
      </View>

      {/* Kart ve bakiye */}
      <View style={styles.cardContainer}>
        <Text style={styles.cardNumber}>{card.cardNumber}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Son Kullanım:</Text>
          <Text style={styles.value}>
            {card.expiryMonth}/{card.expiryYear.slice(-2)}
          </Text>
          <Text style={[styles.label, { marginLeft: 20 }]}>CVV:</Text>
          <Text style={styles.value}>{card.cvv}</Text>
        </View>
        <Text style={styles.balanceLabel}>Bakiye:</Text>
        <Text style={styles.balanceValue}>{card.balance.toFixed(2)} ₺</Text>
      </View>

      {/* IBAN */}
      <View style={styles.ibanContainer}>
        <Text style={styles.ibanLabel}>IBAN:</Text>
        <Text style={styles.ibanValue}>{formattedIban}</Text>
        <TouchableOpacity onPress={copyIban}>
          <Ionicons name="copy-outline" size={20} color="#2c2c97" />
        </TouchableOpacity>
      </View>

      {/* Butonlar */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.transferButton, { flex: 1, marginRight: 8 }]}
          onPress={() => navigation.navigate('Transfer')}
        >
          <Text style={styles.transferButtonText}>Para Gönder</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.transferButton, { flex: 1, marginLeft: 8 }]}
          onPress={() => navigation.navigate('AddMoney')}
        >
          <Text style={styles.transferButtonText}>Para Ekle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.historyIconButton}
          onPress={() => navigation.navigate('Transaction')}
        >
          <Ionicons name="time-outline" size={24} color="#2c2c97" />
          <Text style={styles.historyText}>Geçmiş</Text>
        </TouchableOpacity>
      </View>

      {/* Son İşlemler */}
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Son İşlemler</Text>
      </View>

      {loadingTxns ? (
        <ActivityIndicator
          size="small"
          color="#2c2c97"
          style={{ marginTop: 20 }}
        />
      ) : personalTxns.length === 0 ? (
        <Text style={styles.noHistoryText}>Henüz yapılan işlem yok.</Text>
      ) : (
        <FlatList
          data={personalTxns.slice(0, 3)}
          keyExtractor={item => item.id}
          renderItem={renderTransferItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10
  },
  notificationButton: { padding: 8, marginTop: 2 },
  welcome: { fontSize: 18, fontWeight: 'bold', color: '#2c2c97' },
  cardContainer: { backgroundColor: '#1e1e7e', borderRadius: 12, padding: 20, margin: 20 },
  cardNumber: { color: 'white', fontSize: 20, letterSpacing: 2, marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  label: { color: 'white', fontSize: 14, marginRight: 4 },
  value: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  balanceLabel: { color: 'white', fontSize: 14 },
  balanceValue: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  ibanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 15
  },
  ibanLabel: { fontSize: 14, fontWeight: 'bold', marginRight: 8 },
  ibanValue: { flex: 1, fontSize: 14, color: '#333' },
  buttonsRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, alignItems: 'center' },
  transferButton: { backgroundColor: '#2c2c97', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  transferButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  historyIconButton: { flexDirection: 'row', alignItems: 'center', marginLeft: 12, paddingVertical: 8 },
  historyText: { color: '#2c2c97', fontSize: 14, marginLeft: 6, fontWeight: '600' },
  historyHeader: { marginHorizontal: 20, marginBottom: 10 },
  historyTitle: { fontSize: 18, fontWeight: 'bold' },
  noHistoryText: { alignSelf: 'center', marginTop: 20, fontSize: 14, color: '#666' },
  transferCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  transferRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  transferDescription: { fontSize: 16, fontWeight: '500', color: '#333', flex: 1 },
  transferAmount: { fontSize: 16, fontWeight: 'bold' },
  transferDate: { marginTop: 6, fontSize: 12, color: '#888' },
  counterpartyName: { fontSize: 16, fontWeight: '500', color: '#333' },
  counterpartyIban: { fontSize: 12, color: '#555', marginTop: 4 }
});
