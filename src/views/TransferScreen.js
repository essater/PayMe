// src/views/TransferScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Platform,
  SafeAreaView
} from 'react-native';
import { auth } from '../services/firebase';
import { AuthViewModel } from '../viewmodels/AuthViewModel';
import { TransferViewModel } from '../viewmodels/TransferViewModel';
import { Ionicons } from '@expo/vector-icons';


function formatIbanWithSpaces(text) {
  const onlyChars = text.replace(/\s+/g, '').toUpperCase();
  return onlyChars.match(/.{1,4}/g)?.join(' ') || '';
}

// Sabit “Gönderme Sebebi” listesi:
const REASONS = [
  'Diğer Kira Ödemesi',
  'E-Ticaret Ödemesi',
  'Çalışan Ödemesi',
  'Ticari Ödeme',
  'Bireysel Ödeme',
  'Yatırım',
  'Finansal',
  'Eğitim Ödemesi',
  'Aidat Ödemesi',
  'Konut Kirası Ödemesi',
  'Diğer',
];

export default function TransferScreen({ navigation }) {
  // 1) Gerekli state’ler:
  const [senderIban, setSenderIban] = useState('');              
    // OTURUM AÇAN kullanıcının Firestore’daki IBAN’ı ("TR..."), örn: "TR627053797848411892069229"
  const [ibanRawInput, setIbanRawInput] = useState('');          
    // Sadece TR’nin ardından gelen 24 hanelik digit dizisi, ex: "627053797848411892069229"
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');                          
    // Açıklama (Not)
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // IBAN input’una focus edildiğinde kursörü sona taşımak için ref:
  const ibanInputRef = useRef(null);

  // 2) Oturum açmış kullanıcının IBAN’ını Firestore’dan al
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

  // 3) “Gönderme Sebebi” seçildiğinde modal’ı kapat ve seçimi kaydet
  const selectReason = (item) => {
    setReason(item);
    setShowReasonModal(false);
  };

  // 4) “Gönder” butonuna basıldığında çalışacak fonksiyon
  const handleTransfer = async () => {
    // Ekranda gösterilen mask’li IBAN’ı raw hale getirelim:
    const displayValue = fullDisplayIban();  
    // Örnek: "TR62 7053 7978 4841 1892 0692 29"
    const recipientRaw = displayValue.replace(/\s+/g, '').toUpperCase();
    // → "TR627053797848411892069229"

    // Validation
    if (!recipientRaw.startsWith('TR') || recipientRaw.length !== 26) {
      Alert.alert(
        'Hata',
        'Lütfen eksiksiz ve geçerli bir IBAN girin. Örn: TR62 7053 7978 4841 1892 0692 29'
      );
      return;
    }
    if (!recipientName.trim()) {
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
    // Açıklama (note) isteğe bağlı olabilir.

    if (!senderIban) {
      Alert.alert('Hata', 'Gönderen IBAN bilgisi bulunamadı.');
      return;
    }

    // Firestore’a transfer işlemini kaydet (veya API ile gönder):
     setLoading(true);
  try {
    const result = await TransferViewModel.startTransfer({
      senderIban: senderIban,
      recipientIban: recipientRaw,      // ÖRNEK: "TR627053797848411892069229"
      recipientName: recipientName.trim(),
      amount: parseFloat(amount),
      reason: reason,
      note: note.trim()   
    });

    if (result.success) {
-  Alert.alert("Başarılı", "Transfer gerçekleşti.");
+  navigation.replace('TransferSuccess'); // Yeni ekrana yönlendir
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

  // 5) “Alıcı IBAN” input’una her metin girişinde çalışacak tek handler:
  const handleIbanChange = (text) => {
    // ➊ Boşlukları sil + uppercase:
    let chars = text.replace(/\s+/g, '').toUpperCase();

    // ➋ Eğer başında “TR” varsa, bunu çıkar (slice(2)):
    if (chars.startsWith('TR')) {
      chars = chars.slice(2);
    }

    // ➌ Geri kalan metinden yalnızca rakamları al:
    const newRawDigits = chars.replace(/[^0-9]/g, '');

    // ➍ Silme işlemi mi? (Backspace vb. ile rakam sayısı azalır)
    if (newRawDigits.length < ibanRawInput.length) {
      setIbanRawInput(newRawDigits);
      return;
    }

    // ➎ Ekleme veya yapıştırma mı? (rakam sayısı artmış)
    if (newRawDigits.length > ibanRawInput.length) {
      const limited = newRawDigits.slice(0, 24); // en fazla 24 rakam
      setIbanRawInput(limited);
      return;
    }
  };

  // 6) ►▶ Tam gösterime giden stringi hazırlar (mask’li IBAN):
  const fullDisplayIban = () => {

    const fullRaw = 'TR' + ibanRawInput;                   
    return formatIbanWithSpaces(fullRaw);            
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Üst Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Para Gönder</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* İçerik */}
      <View style={styles.container}>
        {/* 1) Alıcı IBAN */}
        <Text style={styles.label}>Alıcı IBAN</Text>
        <TextInput
          ref={ibanInputRef}
          style={styles.input}
          placeholder="TR__ ____ ____ ____ ____ __"
          placeholderTextColor="#999"
          value={fullDisplayIban()}           // Mask’li gösterim
          onChangeText={handleIbanChange}     // Tek handler hem ekleme, hem silme, hem yapıştırma
          autoCapitalize="characters"
          keyboardType={Platform.OS === 'ios' ? 'default' : 'visible-password'}
          onFocus={() => {
            // İmleci her zaman en sona taşımak için:
            const length = fullDisplayIban().length;
            ibanInputRef.current?.setNativeProps({
              selection: { start: length, end: length }
            });
          }}
        />

        {/* 2) Alıcı Adı Soyadı */}
        <Text style={styles.label}>Alıcı Adı Soyadı</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: Mehmet Yılmaz"
          value={recipientName}
          onChangeText={setRecipientName}
        />

        {/* 3) Tutar (₺) */}
        <Text style={styles.label}>Tutar (₺)</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: 150.00"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        {/* 4) Gönderme Sebebi */}
        <Text style={styles.label}>Gönderme Sebebi</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowReasonModal(true)}
        >
          <Text
            style={{
              color: reason ? '#000' : '#999',
              fontSize: 16
            }}
          >
            {reason || 'Bir sebep seçin'}
          </Text>
        </TouchableOpacity>

        {/* Reason Modal */}
        <Modal
          visible={showReasonModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Gönderme Sebebi</Text>
              <FlatList
                data={REASONS}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => selectReason(item)}
                    style={styles.reasonItem}
                  >
                    <Text style={styles.reasonText}>{item}</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => (
                  <View style={styles.reasonSeparator} />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
              <TouchableOpacity
                onPress={() => setShowReasonModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 5) Açıklama (Not) */}
        <Text style={styles.label}>Açıklama (İsteğe Bağlı)</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Örn: Haziran ayı kirası"
          multiline={true}
          value={note}
          onChangeText={setNote}
        />

        {/* 6) Gönder Butonu */}
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleTransfer}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.sendButtonText}>Gönder</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f2f2'
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ececec'
  },
  backButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },

  container: {
    flex: 1,
    padding: 16
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
    marginTop: 12
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#000'
  },

  // Gönder Butonu
  sendButton: {
    backgroundColor: '#2c2c97',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },

  // Reason Modal stili
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '60%'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ececec'
  },
  reasonItem: {
    paddingVertical: 14,
    paddingHorizontal: 20
  },
  reasonText: {
    fontSize: 16,
    color: '#333'
  },
  reasonSeparator: {
    height: 1,
    backgroundColor: '#ececec',
    marginHorizontal: 20
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