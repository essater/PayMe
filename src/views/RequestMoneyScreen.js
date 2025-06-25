// src/views/RequestMoneyScreen.js

import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { RequestMoneyViewModel } from '../viewmodels/RequestMoneyViewModel';
import { Ionicons } from '@expo/vector-icons';
import { capitalizeFullNameTR } from '../utils/formatters';

function formatIbanWithSpaces(text) {
  return text.replace(/\s+/g,'').toUpperCase().match(/.{1,4}/g)?.join(' ')||'';
}

export default function RequestMoneyScreen({ navigation, route }) {
  const { recipientIban, recipientName } = route.params || {};

  const [amount, setAmount]   = useState('');
  const [note, setNote]       = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!amount || isNaN(+amount) || +amount <= 0) {
      return Alert.alert('Hata', 'Lütfen geçerli bir tutar girin.');
    }
    setLoading(true);
    try {
      await RequestMoneyViewModel.sendRequest({
        recipientIban,
        amount: +amount,
        note: note.trim()
      });
      // Başarılı uyarısını kaldırmak isterseniz burayı kaldırabilirsiniz
      Alert.alert('Başarılı', 'Para isteğiniz gönderildi.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Hata', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Başlık */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#3d5a80" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Para İste</Text>
      </View>

      <View style={styles.container}>
        {/* Salt okunur IBAN */}
        <Text style={styles.label}>IBAN</Text>
        <TextInput
          style={[styles.input, styles.readonly]}
          value={formatIbanWithSpaces(recipientIban || '')}
          editable={false}
        />

        {/* Salt okunur Ad Soyad */}
        <Text style={styles.label}>Ad Soyad</Text>
        <TextInput
          style={[styles.input, styles.readonly]}
          value={capitalizeFullNameTR(recipientName || '')}
          editable={false}
        />

        {/* Tutar girişi */}
        <Text style={styles.label}>Talep Edilen Tutar (₺)</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: 100.00"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        {/* Not alanı */}
        <Text style={styles.label}>Açıklama (İsteğe Bağlı)</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Örn: Kira ödemesi"
          multiline
          value={note}
          onChangeText={setNote}
        />

        {/* Talep gönder butonu */}
        <TouchableOpacity
          style={styles.requestButton}
          onPress={handleRequest}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.requestButtonText}>Talep Gönder</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7fafd' // 🎨 Açık pastel arka plan
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#dbe2ef' // 🎨 Modal çizgiler
  },
backButton: { width: 40, justifyContent: 'center', alignItems: 'center' , color: '#3d5a80'},

   headerTitle: {
   
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#3d5a80'
  },
  container: {
    flex: 1,
    padding: 16
  },
  label: {
    marginTop: 12,
    fontSize: 14,
    color: '#4a5568' // 🎨 Açıklama yazı
  },
  input: {
    marginTop: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dce3ed', // 🎨 Açık gri kenarlık
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    color: '#2b2d42' // 🎨 Koyu başlık
  },
  readonly: {
    backgroundColor: '#f7fafd', // 🎨 Açık pastel arka plan (readonly için)
    color: '#4a5568'
  },
  requestButton: {
    marginTop: 24,
    backgroundColor: '#3d5a80', // 🎨 Buton mavisi
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
