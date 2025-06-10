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
  SafeAreaView,
  Modal,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '../services/firebase';
import * as Clipboard from 'expo-clipboard';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc
} from 'firebase/firestore';
import { capitalizeTR } from '../utils/formatters';
import { NotificationViewModel } from '../viewmodels/NotificationViewModel';
import * as Notifications from 'expo-notifications';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = WINDOW_HEIGHT * 0.5;

export default function HomeScreen({ navigation }) {
  // --- State’ler ---
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [personalTxns, setPersonalTxns] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(true);

  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [sheetVisible, setSheetVisible] = useState(false);

  // Bildirim setup
  useEffect(() => {
    NotificationViewModel.init();
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      navigation.navigate('Notifications');
    });
    return () => {
      Notifications.removeNotificationSubscription(sub);
      NotificationViewModel.cleanup();
    };
  }, []);

  // Kullanıcı verisi
  useEffect(() => {
    const u = auth.currentUser;
    if (!u) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }
    const ref = doc(firestore, 'users', u.uid);
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) setUserData(snap.data());
      else Alert.alert('Hata', 'Kullanıcı verisi bulunamadı.');
      setLoadingUser(false);
    });
    return unsub;
  }, []);

  // İşlem geçmişi
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const q = query(
      collection(firestore, 'users', uid, 'transactions'),
      orderBy('date', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setPersonalTxns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingTxns(false);
    }, () => setLoadingTxns(false));
    return unsub;
  }, []);

  // Arkadaş listesi
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const q = query(
      collection(firestore, 'users', uid, 'friends'),
      orderBy('nickname', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setFriends(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingFriends(false);
    }, err => {
      console.error(err);
      setLoadingFriends(false);
    });
    return unsub;
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

  // “Para İste” akışı
  const openSheet = () => setSheetVisible(true);
  const closeSheet = () => setSheetVisible(false);
  const selectFriend = friend => {
    closeSheet();
    navigation.navigate('RequestMoney', { recipientIban: friend.iban,                          
     recipientName: `${friend.name}` });
  };

  // Transfer listesi render fonksiyonu
  const renderTransferItem = ({ item }) => {
    const dateObj = item.date?.toDate ? item.date.toDate() : new Date(item.date);
    const fd = dateObj.toLocaleDateString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
    const desc = (item.reason || '') + (item.note ? ' • ' + item.note : '');
    const isOut = item.direction === 'out';
    const title = isOut ? item.recipientName : item.senderName;
    const ibanLine = (isOut ? item.recipientAccountId : item.senderAccountId)
      .replace(/(.{4})/g, '$1 ').trim();
    const sign = isOut ? '-' : '+';
    const color = isOut ? '#d32f2f' : '#388e3c';

    return (
      <View style={styles.transferCard}>
        <Text style={styles.counterpartyName}>{title}</Text>
        <Text style={styles.counterpartyIban}>{ibanLine}</Text>
        <View style={styles.transferRow}>
          <Text style={styles.transferDescription}>{desc}</Text>
          <Text style={[styles.transferAmount, { color }]}>
            {sign}{Math.abs(item.amount).toFixed(2)} ₺
          </Text>
        </View>
        <Text style={styles.transferDate}>{fd}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <Text style={styles.welcome}>Hoş geldin, {capitalizeTR(name)}</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#2c2c97" />
        </TouchableOpacity>
      </View>

      {/* KART */}
      <View style={styles.cardContainer}>
        <Text style={styles.cardNumber}>{card.cardNumber}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>SKT:</Text>
          <Text style={styles.value}>{card.expiryMonth}/{card.expiryYear.slice(-2)}</Text>
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

      {/* BUTONLAR */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.transferButton, { flex: 1, marginRight: 8 }]}
          onPress={() => navigation.navigate('Transfer')}
        >
          <Text style={styles.transferButtonText}>Para Gönder</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.transferButton, { flex: 1, marginLeft: 8 }]}
          onPress={openSheet}
        >
          <Text style={styles.transferButtonText}>Para İste</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyIconButton}
          onPress={() => navigation.navigate('Transaction')}
        >
          <Ionicons name="time-outline" size={24} color="#2c2c97" />
          <Text style={styles.historyText}>Geçmiş</Text>
        </TouchableOpacity>
      </View>

      {/* SON İŞLEMLER */}
      <Text style={styles.historyTitle}>Son İşlemler</Text>
      {loadingTxns ? (
        <ActivityIndicator size="small" color="#2c2c97" style={{ marginTop: 20 }} />
      ) : personalTxns.length === 0 ? (
        <Text style={styles.noHistoryText}>Henüz işlem yok.</Text>
      ) : (
        <FlatList
          data={personalTxns.slice(0, 3)}
          keyExtractor={i => i.id}
          renderItem={renderTransferItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* ─────────── Bottom Sheet ─────────── */}
      <Modal
        transparent
        visible={sheetVisible}
        animationType="fade"
        onRequestClose={closeSheet}
      >
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <View style={styles.sheetContainer}>
          <View style={styles.dragHandle} />
          <Text style={styles.sheetTitle}>Arkadaş Seç</Text>

          {loadingFriends ? (
            <ActivityIndicator size="large" />
          ) : friends.length === 0 ? (
            <Text style={styles.emptyText}>Henüz arkadaşınız yok.</Text>
          ) : (
            <FlatList
              data={friends}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.friendItem}
                  onPress={() => selectFriend(item)}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {item.nickname.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.friendNickname}>{item.nickname}</Text>
                    <Text style={styles.friendFullname}>
                      {item.name} {item.surname}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}

          <TouchableOpacity style={styles.closeButton} onPress={closeSheet}>
            <Text style={styles.closeButtonText}>Vazgeç</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    margin: 20
  },
  welcome: { fontSize: 20, fontWeight: 'bold', color: '#2c2c97' },
  notificationButton: { padding: 8 },

  cardContainer: {
    backgroundColor: '#1e1e7e',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20
  },
  cardNumber: { color: 'white', fontSize: 22, letterSpacing: 2, marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  label: { color: 'white', fontSize: 14, marginRight: 6 },
  value: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  balanceLabel: { color: 'white', fontSize: 14 },
  balanceValue: { color: 'white', fontSize: 26, fontWeight: 'bold' },

  ibanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 20
  },
  ibanLabel: { fontSize: 14, fontWeight: 'bold', marginRight: 8 },
  ibanValue: { flex: 1, fontSize: 14, color: '#333' },

  buttonsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20
  },
  transferButton: {
    backgroundColor: '#2c2c97',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  transferButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  historyIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12
  },
  historyText: { color: '#2c2c97', fontSize: 14, marginLeft: 6, fontWeight: '600' },

  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 10
  },
  noHistoryText: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#666' },

  transferCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  transferRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  transferDescription: { fontSize: 15, fontWeight: '500', color: '#333', flex: 1 },
  transferAmount: { fontSize: 16, fontWeight: 'bold' },
  transferDate: { marginTop: 6, fontSize: 12, color: '#888' },
  counterpartyName: { fontSize: 16, fontWeight: '500', color: '#333' },
  counterpartyIban: { fontSize: 12, color: '#555', marginTop: 4 },

  // ─── Bottom-sheet ve overlay ───
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  sheetContainer: {  
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: SHEET_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 12
  },
  dragHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    marginBottom: 8
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '600',
    alignSelf: 'center',
    marginBottom: 12
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666'
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2c2c97',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  friendNickname: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  friendFullname: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  closeButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 8
  },
  closeButtonText: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: '600'
  }
});
