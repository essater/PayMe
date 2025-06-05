// src/views/TransactionScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore, auth } from '../services/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { AuthViewModel } from '../viewmodels/AuthViewModel';

export default function TransactionScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('1m');
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
    let startDate = new Date();
    if (selectedRange === '1m') startDate.setMonth(now.getMonth() - 1);
    else if (selectedRange === '3m') startDate.setMonth(now.getMonth() - 3);
    else if (selectedRange === '6m') startDate.setMonth(now.getMonth() - 6);

    const transfersRef = collection(firestore, 'transfers');
    const q = query(
      transfersRef,
      where('senderAccountId', '==', userData.iban),
      where('date', '>=', startDate),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransfers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData, selectedRange]);

  const renderTransferItem = ({ item }) => {
    const dateObj = item.date?.toDate ? item.date.toDate() : new Date(item.date);
    const formattedDate = dateObj.toLocaleDateString('tr-TR');
    return (
      <View style={styles.transferCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.transferDescription}>{item.reason || 'İşlem'} - {item.note || ''}</Text>
          <Text style={styles.transferAmount}>- {item.amount.toFixed(2)} ₺</Text>
        </View>
        <Text style={styles.transferDate}>{formattedDate}</Text>
      </View>
    );
  };

  const renderRangeLabel = () => {
    if (selectedRange === '1m') return 'Son 1 Ay';
    if (selectedRange === '3m') return 'Son 3 Ay';
    if (selectedRange === '6m') return 'Son 6 Ay';
    return 'Tüm Zamanlar';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Tüm İşlemler</Text>
      </View>

      <TouchableOpacity
        style={styles.rangeSelector}
        onPress={() => setShowRangeModal(true)}
      >
        <Text style={styles.rangeSelectorText}>{renderRangeLabel()}</Text>
        <Ionicons name="chevron-down" size={20} color="#333" />
      </TouchableOpacity>

      <Modal visible={showRangeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tarih Aralığı Seç</Text>
            {[{ key: '1m', label: 'Son 1 Ay' }, { key: '3m', label: 'Son 3 Ay' }, { key: '6m', label: 'Son 6 Ay' }].map(item => (
              <TouchableOpacity
                key={item.key}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedRange(item.key);
                  setShowRangeModal(false);
                  setLoading(true);
                }}
              >
                <Text style={styles.modalText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowRangeModal(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading ? (
        <ActivityIndicator size="large" color="#2c2c97" style={{ marginTop: 20 }} />
      ) : transfers.length === 0 ? (
        <Text style={styles.noHistoryText}>Belirtilen aralıkta transfer bulunamadı.</Text>
      ) : (
        <FlatList
          data={transfers}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ddd'
  },
  headerText: { fontSize: 18, fontWeight: 'bold', marginLeft: 12 },
  noHistoryText: {
    marginTop: 20,
    alignSelf: 'center',
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
    fontWeight: 'bold',
    color: '#d32f2f'
  },
  transferDate: {
    marginTop: 6,
    fontSize: 12,
    color: '#888'
  },
  rangeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    margin: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 20
  },
  rangeSelectorText: {
    fontSize: 14,
    marginRight: 6,
    color: '#333'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '40%'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ececec'
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 20
  },
  modalText: {
    fontSize: 16,
    color: '#333'
  },
  modalCloseButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ececec'
  },
  modalCloseText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600'
  }
});