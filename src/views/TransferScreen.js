import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, Modal, FlatList, Platform, SafeAreaView
} from 'react-native';
import { auth } from '../services/firebase';
import { AuthViewModel } from '../viewmodels/AuthViewModel';
import { TransferViewModel } from '../viewmodels/TransferViewModel';
import { Ionicons } from '@expo/vector-icons';
import { capitalizeFullNameTR } from '../utils/formatters'; // <== Türkçe büyük harf fonksiyonu

function formatIbanWithSpaces(text) {
  const onlyChars = text.replace(/\s+/g, '').toUpperCase();
  return onlyChars.match(/.{1,4}/g)?.join(' ') || '';
}

const REASONS = [
  'Diğer Kira Ödemesi', 'E-Ticaret Ödemesi', 'Çalışan Ödemesi',
  'Ticari Ödeme', 'Bireysel Ödeme', 'Yatırım', 'Finansal',
  'Eğitim Ödemesi', 'Aidat Ödemesi', 'Konut Kirası Ödemesi', 'Diğer',
];

export default function TransferScreen({ navigation, route }) {
  const { recipientIban, recipientName } = route.params || {};

  const [senderIban, setSenderIban] = useState('');
  const [ibanRawInput, setIbanRawInput] = useState('');
  const [recipientNameState, setRecipientName] = useState(recipientName || '');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const ibanInputRef = useRef(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Hata', 'Lütfen önce giriş yapın.');
      navigation.goBack();
      return;
    }
    AuthViewModel.getUserData(currentUser.uid).then((result) => {
      if (result.success) {
        setSenderIban(result.data.iban || '');
      } else {
        console.error('TransferScreen: getUserData Hatası', result.error);
        Alert.alert('Hata', 'Kullanıcı verisi yüklenemedi.');
        navigation.goBack();
      }
    });
  }, []);

  useEffect(() => {
    if (recipientIban) {
      const cleanIban = recipientIban.toUpperCase().replace(/^TR/, '');
      setIbanRawInput(cleanIban);
    }
  }, [recipientIban]);

  const handleIbanChange = (text) => {
    if (recipientIban) return; // QR'dan geldiyse kullanıcı IBAN'ı değiştiremesin
    let chars = text.replace(/\s+/g, '').toUpperCase();
    if (chars.startsWith('TR')) chars = chars.slice(2);
    const newRawDigits = chars.replace(/[^0-9]/g, '');
    if (newRawDigits.length <= 24) setIbanRawInput(newRawDigits);
  };

  const fullDisplayIban = () => {
    const fullRaw = 'TR' + ibanRawInput;
    return formatIbanWithSpaces(fullRaw);
  };

  const selectReason = (item) => {
    setReason(item);
    setShowReasonModal(false);
  };

  const handleTransfer = async () => {
    const displayValue = fullDisplayIban();
    const recipientRaw = displayValue.replace(/\s+/g, '').toUpperCase();

    if (!recipientRaw.startsWith('TR') || recipientRaw.length !== 26) {
      Alert.alert('Hata', 'Lütfen geçerli bir IBAN girin.');
      return;
    }
    if (!recipientNameState.trim()) {
      Alert.alert('Hata', 'Lütfen alıcının adını girin.');
      return;
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir tutar girin.');
      return;
    }
    if (!reason) {
      Alert.alert('Hata', 'Lütfen bir gönderme sebebi seçin.');
      return;
    }
    if (!senderIban) {
      Alert.alert('Hata', 'Gönderen IBAN bilgisi bulunamadı.');
      return;
    }

    setLoading(true);
    try {
      const result = await TransferViewModel.startTransfer({
        senderIban: senderIban,
        recipientIban: recipientRaw,
        recipientName: recipientNameState.trim(),
        amount: parseFloat(amount),
        reason: reason,
        note: note.trim()
      });

      if (result.success) {
        navigation.replace('TransferSuccess');
      } else {
        throw result.error;
      }
    } catch (err) {
      console.error("TransferScreen Hata:", err);
      Alert.alert("Hata", err.message || "Transfer yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Para Gönder</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.container}>
        <Text style={styles.label}>Alıcı IBAN</Text>
        <TextInput
          ref={ibanInputRef}
          style={[
            styles.input,
            recipientIban && { backgroundColor: '#f0f0f0', color: '#555' }
          ]}
          placeholder="TR__ ____ ____ ____ ____ __"
          placeholderTextColor="#999"
          value={fullDisplayIban()}
          onChangeText={handleIbanChange}
          autoCapitalize="characters"
          editable={!recipientIban}
        />

        <Text style={styles.label}>Alıcı Adı Soyadı</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: Mehmet Yılmaz"
          value={capitalizeFullNameTR(recipientNameState)}
          onChangeText={setRecipientName}
        />

        <Text style={styles.label}>Tutar (₺)</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: 150.00"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>Gönderme Sebebi</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowReasonModal(true)}>
          <Text style={{ color: reason ? '#000' : '#999', fontSize: 16 }}>
            {reason || 'Bir sebep seçin'}
          </Text>
        </TouchableOpacity>

        <Modal visible={showReasonModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Gönderme Sebebi</Text>
              <FlatList
                data={REASONS}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => selectReason(item)} style={styles.reasonItem}>
                    <Text style={styles.reasonText}>{item}</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.reasonSeparator} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
              <TouchableOpacity onPress={() => setShowReasonModal(false)} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Text style={styles.label}>Açıklama (İsteğe Bağlı)</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Örn: Haziran ayı kirası"
          multiline
          value={note}
          onChangeText={setNote}
        />

        <TouchableOpacity style={styles.sendButton} onPress={handleTransfer} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.sendButtonText}>Gönder</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f2f2f2' },
  headerBar: {
    flexDirection: 'row', alignItems: 'center',
    height: 56, paddingHorizontal: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderColor: '#ececec'
  },
  backButton: { width: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#333' },
  container: { flex: 1, padding: 16 },
  label: { fontSize: 14, marginBottom: 6, color: '#333', marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    backgroundColor: '#fff', fontSize: 16, color: '#000'
  },
  sendButton: {
    backgroundColor: '#2c2c97', paddingVertical: 14,
    borderRadius: 8, alignItems: 'center', marginTop: 24
  },
  sendButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff', borderTopLeftRadius: 12,
    borderTopRightRadius: 12, maxHeight: '60%'
  },
  modalTitle: {
    fontSize: 16, fontWeight: '600', textAlign: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderColor: '#ececec'
  },
  reasonItem: { paddingVertical: 14, paddingHorizontal: 20 },
  reasonText: { fontSize: 16, color: '#333' },
  reasonSeparator: { height: 1, backgroundColor: '#ececec', marginHorizontal: 20 },
  modalCloseButton: {
    paddingVertical: 14, alignItems: 'center', borderTopWidth: 1, borderColor: '#ececec'
  },
  modalCloseText: { fontSize: 16, color: '#007AFF', fontWeight: '600' }
});
