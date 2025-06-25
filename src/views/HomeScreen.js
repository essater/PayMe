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
  Dimensions,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '../services/firebase';
import * as Clipboard from 'expo-clipboard';
import { collection, query, orderBy, onSnapshot, doc, where } from 'firebase/firestore';
import { capitalizeTR } from '../utils/formatters';
import { NotificationViewModel } from '../viewmodels/NotificationViewModel';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = WINDOW_HEIGHT * 0.5;

export default function HomeScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [personalTxns, setPersonalTxns] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(true);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);  // <-- BURAYA EKLEDİK

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

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const q = query(collection(firestore, 'users', uid, 'transactions'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setPersonalTxns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingTxns(false);
    }, () => setLoadingTxns(false));
    return unsub;
  }, []);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const q = query(collection(firestore, 'users', uid, 'friends'), orderBy('nickname', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setFriends(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingFriends(false);
    }, err => {
      console.error(err);
      setLoadingFriends(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const notifRef = collection(firestore, 'users', uid, 'notifications');
    const q = query(notifRef, where('read', '==', false));
    const unsub = onSnapshot(q, snap => {
      setUnreadCount(snap.size);
    });
    return unsub;
  }, []);

  if (loadingUser) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3d5a80" />
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

  const openSheet = () => setSheetVisible(true);
  const closeSheet = () => setSheetVisible(false);
  const selectFriend = friend => {
    closeSheet();
    navigation.navigate('RequestMoney', { recipientIban: friend.iban, recipientName: `${friend.name}` });
  };

  const renderTransferItem = ({ item }) => {
    const dateObj = item.date?.toDate ? item.date.toDate() : new Date(item.date);
    const fd = dateObj.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const desc = (item.reason || '') + (item.note ? ' • ' + item.note : '');
    const isOut = item.direction === 'out';
    const title = isOut ? item.recipientName : item.senderName;
    const ibanLine = (isOut ? item.recipientAccountId : item.senderAccountId).replace(/(.{4})/g, '$1 ').trim();
    const sign = isOut ? '-' : '+';
    const color = isOut ? '#d32f2f' : '#388e3c';

    return (
      <View style={styles.transferCard}>
        <Text style={styles.counterpartyName}>{title}</Text>
        <Text style={styles.counterpartyIban}>{ibanLine}</Text>
        <View style={styles.transferRow}>
          <Text style={styles.transferDescription}>{desc}</Text>
          <Text style={[styles.transferAmount, { color }]}> {sign}{Math.abs(item.amount).toFixed(2)} ₺</Text>
        </View>
        <Text style={styles.transferDate}>{fd}</Text>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#f7fafd', '#eaf0f6']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <Text style={styles.welcome}>Hoş geldin, {capitalizeTR(name)}</Text>
          <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notifications')}>
            <View>
              <Image source={require('../../assets/bell.png')} style={{ width: 24, height: 24, tintColor: '#3d5a80' }} />
              {unreadCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -3,
                  right: -3,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#d32f2f'
                }} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
          <LinearGradient colors={['#4a6fa5', '#3d5a80']} style={styles.gradient}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Ionicons name="card-outline" size={28} color="#fff" />
            </View>

            {showCardDetails ? (
              <>
                <Text style={styles.cardNumber}>{card.cardNumber}</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>EXP DATE:</Text>
                  <Text style={styles.value}>{card.expiryMonth}/{card.expiryYear.slice(-2)}</Text>
                  <Text style={[styles.label, { marginLeft: 20 }]}>CVV:</Text>
                  <Text style={styles.value}>{card.cvv}</Text>
                </View>
                <Text style={styles.balanceLabel}>Bakiye:</Text>
                <Text style={styles.balanceValue}>{card.balance.toFixed(2)} ₺</Text>
              </>
            ) : (
              <View style={{ height: 90 }} />
            )}

            <Image source={require('../../assets/mastercard_icon.png')} style={styles.logo} />
          </LinearGradient>
      </View>

      <View style={styles.ibanContainer}>
        <Text style={styles.ibanLabel}>IBAN:</Text>
        <Text style={styles.ibanValue}>{formattedIban}</Text>
        <TouchableOpacity onPress={copyIban}>
          <Ionicons name="copy-outline" size={20} color="#3d5a80" />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={[styles.transferButton, { flex: 1, marginRight: 8 }]} onPress={() => navigation.navigate('Transfer')}>
          <Image source={require('../../assets/gitti.png')} style={[styles.buttonIcon, { tintColor: 'white' }]} />
          <Text style={styles.transferButtonText}>MePay</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.transferButton, { flex: 1, marginLeft: 8 }]} onPress={openSheet}>
          <Image source={require('../../assets/geldi.png')} style={[styles.buttonIcon, { tintColor: 'white' }]} />
          <Text style={styles.transferButtonText}>PayMe</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.historyIconButton} onPress={() => navigation.navigate('Transaction')}>
          <Image source={require('../../assets/history_icon.png')} style={{ width: 24, height: 24, tintColor: '#3d5a80' }} />
          <Text style={styles.historyText}>Geçmiş</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.historyTitle}>Son İşlemler</Text>
      {loadingTxns ? (
        <ActivityIndicator size="small" color="#3d5a80" style={{ marginTop: 20 }} />
      ) : personalTxns.length === 0 ? (
        <Text style={styles.noHistoryText}>Henüz işlem yok.</Text>
      ) : (
        <FlatList data={personalTxns.slice(0, 3)} keyExtractor={i => i.id} renderItem={renderTransferItem} contentContainerStyle={{ paddingBottom: 20 }} />
      )}

      <Modal transparent visible={sheetVisible} animationType="fade" onRequestClose={closeSheet}>
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
            <FlatList data={friends} keyExtractor={item => item.id} renderItem={({ item }) => (
              <TouchableOpacity style={styles.friendItem} onPress={() => selectFriend(item)}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.nickname.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.friendNickname}>{item.nickname}</Text>
                  <Text style={styles.friendFullname}>{item.name} {item.surname}</Text>
                </View>
              </TouchableOpacity>
            )} />
          )}

          <TouchableOpacity style={styles.closeButton} onPress={closeSheet}>
            <Text style={styles.closeButtonText}>Vazgeç</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  </LinearGradient>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 20 },
  welcome: { fontSize: 20, fontWeight: 'bold', color: '#3d5a80' },
  notificationButton: { padding: 8 },
  cardContainer: { borderRadius: 16, marginHorizontal: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 8 },
  gradient: { borderRadius: 16, padding: 20, position: 'relative' },
  cardNumber: { color: 'white', fontSize: 22, letterSpacing: 2, marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  label: { color: 'white', fontSize: 14, marginRight: 6 },
  value: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  balanceLabel: { color: 'white', fontSize: 14 },
  balanceValue: { color: 'white', fontSize: 26, fontWeight: 'bold' },
  logo: { width: 50, height: 30, position: 'absolute', top: 20, right: 20 },
  ibanContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 14, marginHorizontal: 20, marginBottom: 20 },
  ibanLabel: { fontSize: 14, fontWeight: 'bold', marginRight: 8 },
  ibanValue: { flex: 1, fontSize: 14, color: '#333' },
  buttonsRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, alignItems: 'center' },
  transferButton: { backgroundColor: '#3d5a80', paddingVertical: 10, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  buttonIcon: { width: 20, height: 20, marginRight: 6 },
  transferButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  historyIconButton: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  historyText: { color: '#3d5a80', fontSize: 14, marginLeft: 6, fontWeight: '600' },
  historyTitle: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 10, color: '#3d5a80' },
  noHistoryText: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#999' },
  transferCard: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 12, borderRadius: 10, padding: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4, borderColor: '#ddd',borderWidt: 1, },
  transferRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  transferDescription: { fontSize: 15, fontWeight: '500', color: '#333', flex: 1 },
  transferAmount: { fontSize: 16, fontWeight: 'bold' },
  transferDate: { marginTop: 6, fontSize: 12, color: '#888' },
  counterpartyName: { fontSize: 16, fontWeight: '500', color: '#333' },
  counterpartyIban: { fontSize: 12, color: '#555', marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheetContainer: { position: 'absolute', bottom: 0, width: '100%', height: SHEET_HEIGHT, backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingHorizontal: 20, paddingTop: 12 },
  dragHandle: { alignSelf: 'center', width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginBottom: 8 },
  sheetTitle: { fontSize: 22, fontWeight: '600', alignSelf: 'center', marginBottom: 12 },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#666' },
  friendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#3d5a80', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: 'white', fontSize: 16, fontWeight: '600' },
   friendNickname: { fontSize: 16, fontWeight: '500', color: '#333' },
  friendFullname: { fontSize: 12, color: '#666', marginTop: 2 },
  closeButton: { marginTop: 12, alignSelf: 'center', paddingVertical: 50 },
  closeButtonText: { fontSize: 16, color: '#d32f2f', fontWeight: '600' }
});