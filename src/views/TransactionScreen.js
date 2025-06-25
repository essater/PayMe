// src/views/TransactionScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore, auth } from '../services/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { AuthViewModel } from '../viewmodels/AuthViewModel';

export default function TransactionScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'in' | 'out'
  const [showRangeModal, setShowRangeModal] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    AuthViewModel.getUserData(currentUser.uid).then((res) => {
      if (res.success) setUserData(res.data);
    });
  }, []);

  useEffect(() => {
    if (!userData?.iban) return;

    const now = new Date();
    let startDate = new Date(0);
    if (selectedRange === '1m') startDate.setMonth(now.getMonth() - 1);
    else if (selectedRange === '3m') startDate.setMonth(now.getMonth() - 3);
    else if (selectedRange === '6m') startDate.setMonth(now.getMonth() - 6);

    const txnsRef = collection(firestore, 'users', auth.currentUser.uid, 'transactions');
    const q = query(
      txnsRef,
      where('date', '>=', startDate),
      orderBy('date', 'desc')
    );

    setLoading(true);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        if (filterType === 'in') data = data.filter((tx) => tx.direction === 'in');
        else if (filterType === 'out') data = data.filter((tx) => tx.direction === 'out');
        setTransactions(data);
        setLoading(false);
      },
      (error) => {
        console.error('Transaction dinleme hatası:', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [userData, selectedRange, filterType]);

  const renderTransactionItem = ({ item }) => {
    const dateObj = item.date?.toDate ? item.date.toDate() : new Date(item.date);
    const formattedDate = dateObj.toLocaleDateString('tr-TR');
    const isCredit = item.direction === 'in';
    const sign = isCredit ? '+' : '-';
    const color = isCredit ? '#2e7d32' : '#d32f2f';

    const name = isCredit ? item.senderName : item.recipientName;
    const iban = isCredit ? item.senderAccountId : item.recipientAccountId;

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.counterparty}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.iban}>{iban}</Text>
          </View>
          <Text style={[styles.amount, { color }]}>
            {sign}{Math.abs(item.amount).toFixed(2)} ₺
          </Text>
        </View>
        <Text style={styles.date}>{formattedDate}</Text>
        {item.reason || item.note ? (
          <Text style={styles.note}>
            {item.reason}{item.note ? ` - ${item.note}` : ''}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderRangeLabel = () => {
    if (selectedRange === '1m') return 'Son 1 Ay';
    if (selectedRange === '3m') return 'Son 3 Ay';
    if (selectedRange === '6m') return 'Son 6 Ay';
    return 'Son 1 Ay';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3d5a80" />
        </TouchableOpacity>
        <Text style={styles.title}>Tüm İşlemler</Text>
      </View>

      <View style={styles.toggleContainer}>
        {['in', 'out', 'all'].map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.toggleBtn, filterType === key && styles.toggleActive]}
            onPress={() => setFilterType(key)}
          >
            <Text style={[styles.toggleText, filterType === key && styles.toggleTextActive]}>
              {key === 'in' ? 'Gelen' : key === 'out' ? 'Giden' : 'Tümü'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.rangeSelector} onPress={() => setShowRangeModal(true)}>
        <Text style={styles.rangeText}>{renderRangeLabel()}</Text>
        <Ionicons name="chevron-down" size={20} color="#333" />
      </TouchableOpacity>

      <Modal visible={showRangeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {[{ key: '1m', label: 'Son 1 Ay' }, { key: '3m', label: 'Son 3 Ay' }, { key: '6m', label: 'Son 6 Ay' }].map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedRange(opt.key);
                  setShowRangeModal(false);
                }}
              >
                <Text style={styles.modalText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowRangeModal(false)}>
              <Text style={styles.modalCancelText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading ? (
        <ActivityIndicator size="large" color="#2c2c97" style={styles.loading} />
      ) : transactions.length === 0 ? (
        <Text style={styles.empty}>Belirtilen aralıkta işlem bulunamadı.</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransactionItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafd' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#dce3ed'
  },
  backButton: { marginRight: 8, color: '#3d5a80' },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d5a80'
  },

  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 16
  },
  toggleBtn: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#dce3ed',
    marginHorizontal: 4
  },
  toggleActive: {
    backgroundColor: '#3d5a80'
  },
  toggleText: {
    fontSize: 14,
    color: '#4a5568'
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: '600'
  },

  rangeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#dce3ed',
    borderRadius: 20
  },
  rangeText: {
    marginRight: 4,
    fontSize: 14,
    color: '#2b2d42'
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#dbe2ef'
  },
  modalItem: {
  paddingVertical: 16,
  alignItems: 'center',
  borderBottomWidth: 1,
  borderColor: '#dbe2ef' // Modal çizgisi
},
  modalText: {
    fontSize: 16,
    color: '#2b2d42'
  },
  modalCancel: {
  alignItems: 'center',
  paddingVertical: 14,
  backgroundColor: '#fff',
  borderTopWidth: 1,
  borderColor: '#dbe2ef'
},
  modalCancelText: {
    fontSize: 16,
    color: '#e63946',
    fontWeight: '600'
  },

  loading: { marginTop: 20 },
  empty: {
    marginTop: 20,
    textAlign: 'center',
    color: '#4a5568'
  },

  list: { paddingBottom: 20 },
  card: {
    backgroundColor: '#f7fafd',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#dce3ed'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  counterparty: { flex: 1 },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2b2d42'
  },
  iban: {
    fontSize: 12,
    color: '#4a5568',
    marginTop: 2
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  date: {
    marginTop: 6,
    fontSize: 12,
    color: '#4a5568'
  },
  note: {
    marginTop: 4,
    fontSize: 14,
    color: '#4a5568'
  }
});