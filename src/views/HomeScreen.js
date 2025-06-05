// src/views/HomeScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebase';
import { AuthViewModel } from '../viewmodels/AuthViewModel';
import Clipboard from '@react-native-clipboard/clipboard';
import { firestore } from '../services/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

export default function HomeScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [personalTxns, setPersonalTxns] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }

    AuthViewModel.getUserData(currentUser.uid)
      .then((result) => {
        if (result.success) {
          setUserData(result.data);
        } else {
          console.error('❌ Kullanıcı verisi alınamadı:', result.error);
          Alert.alert('Hata', 'Kullanıcı verisi yüklenemedi.');
        }
      })
      .finally(() => setLoadingUser(false));
  }, []);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const userTxnRef = collection(firestore, 'users', uid, 'transactions');
    const q = query(userTxnRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setPersonalTxns(list);
      setLoadingTxns(false);
    }, (error) => {
      console.error("❌ Transaction dinleme hatası:", error);
      setLoadingTxns(false);
    });

    return () => unsubscribe();
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

  const { card, iban: rawIban } = userData;
  const formattedIban = rawIban.replace(/(.{4})/g, '$1 ').trim();

  const copyIbanToClipboard = () => {
    Clipboard.setString(rawIban);
    Alert.alert('Kopyalandı', 'IBAN panoya kopyalandı.');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      console.error('❌ Çıkış Yap Hatası:', error);
      Alert.alert('Hata', 'Çıkış yapılamadı. Lütfen tekrar deneyin.');
    }
  };

  const renderTransferItem = ({ item }) => {
    const dateObj = item.date?.toDate ? item.date.toDate() : new Date(item.date);
    const formattedDate = dateObj.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const desc = (item.reason || '') + (item.note ? ' - ' + item.note : '');
    const isOutgoing = item.senderAccountId === userData.iban;

    return (
      <View style={styles.transferCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.transferDescription}>{desc}</Text>
          <Text style={[styles.transferAmount, { color: isOutgoing ? '#d32f2f' : '#388e3c' }]}> {isOutgoing ? '-' : '+'} {item.amount.toFixed(2)} ₺</Text>
        </View>
        <Text style={styles.transferDate}>{formattedDate}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        <Text style={styles.cardNumber}>{card.cardNumber}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Son Kullanım:</Text>
          <Text style={styles.value}>{card.expiryMonth}/{card.expiryYear.slice(-2)}</Text>
          <Text style={[styles.label, { marginLeft: 20 }]}>CVV:</Text>
          <Text style={styles.value}>{card.cvv}</Text>
        </View>
        <Text style={styles.balanceLabel}>Bakiye:</Text>
        <Text style={styles.balanceValue}>{card.balance.toFixed(2)} ₺</Text>
      </View>

      <View style={styles.ibanContainer}>
        <Text style={styles.ibanLabel}>IBAN:</Text>
        <Text style={styles.ibanValue}>{formattedIban}</Text>
        <TouchableOpacity style={styles.copyButton} onPress={copyIbanToClipboard}>
          <Text style={styles.copyText}>Kopyala</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 20 }}>
        <TouchableOpacity
          style={[styles.transferButton, { flex: 1, marginRight: 8 }]}
          onPress={() => navigation.navigate('Transfer')}
        >
          <Text style={styles.transferButtonText}>Para Gönder</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 }}
          onPress={() => navigation.navigate('Transaction')}
        >
          <Ionicons name="time-outline" size={28} color="#2c2c97" />
        </TouchableOpacity>
      </View>

      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Son İşlemler</Text>
      </View>

      {loadingTxns ? (
        <ActivityIndicator size="small" color="#2c2c97" style={{ marginTop: 20 }} />
      ) : personalTxns.length === 0 ? (
        <Text style={styles.noHistoryText}>Henüz yapılan işlem yok.</Text>
      ) : (
        <FlatList
          data={personalTxns.slice(0, 3)}
          keyExtractor={(item) => item.id}
          renderItem={renderTransferItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ddd'
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#d32f2f',
    borderRadius: 6
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  cardContainer: {
    backgroundColor: '#1e1e7e',
    borderRadius: 12,
    padding: 20,
    margin: 20
  },
  cardNumber: {
    color: 'white',
    fontSize: 20,
    letterSpacing: 2,
    marginBottom: 15
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  label: {
    color: 'white',
    fontSize: 14,
    marginRight: 4
  },
  value: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  balanceLabel: {
    color: 'white',
    fontSize: 14
  },
  balanceValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold'
  },
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
  ibanLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8
  },
  ibanValue: {
    flex: 1,
    fontSize: 14,
    color: '#333'
  },
  copyButton: {
    backgroundColor: '#2c2c97',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center'
  },
  copyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  transferButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#2c2c97',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  transferButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  historyHeader: {
    marginHorizontal: 20,
    marginBottom: 10
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  noHistoryText: {
    alignSelf: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#666'
  },
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
  transferDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  transferAmount: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  transferDate: {
    marginTop: 6,
    fontSize: 12,
    color: '#888'
  }
});
