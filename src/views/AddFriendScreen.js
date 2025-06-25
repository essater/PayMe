// src/views/AddFriendScreen.js

import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FriendRequestViewModel } from '../viewmodels/FriendRequestViewModel';

// IBAN'i 4'erli gruplarla gösteren yardımcı
function formatIbanWithSpaces(text) {
  const onlyChars = text.replace(/\s+/g, '').toUpperCase();
  return onlyChars.match(/.{1,4}/g)?.join(' ') || '';
}

export default function AddFriendScreen({ navigation }) {
  // ibanRaw: TR'den sonraki 24 hane
  const [ibanRaw, setIbanRaw] = useState('');
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const fullIban = 'TR' + ibanRaw;
    if (!/^TR\d{24}$/.test(fullIban)) {
      Alert.alert(
        'Geçersiz IBAN',
        'Lütfen TR ile başlayan, toplam 26 karakterli geçerli bir IBAN girin.'
      );
      return;
    }
    if (!fullName.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen Ad Soyad girin.');
      return;
    }
    if (!nickname.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen Takma Ad girin.');
      return;
    }

    setLoading(true);
    try {
      await FriendRequestViewModel.sendRequest({
        iban: fullIban,
        name: fullName.trim(),
        nickname: nickname.trim()
      });
      Alert.alert('Başarılı', 'Arkadaşlık isteği gönderildi.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Hata', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* HEADER */}
       <View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
    <Ionicons name="chevron-back" size={24} color="#3d5a80" />
  </TouchableOpacity>
  <Text style={styles.title}>Arkadaş Ekle</Text>
  <View style={{ width: 40 }} />
</View>

        {/* FORM */}
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Arkadaşın IBAN’ı</Text>
          <TextInput
            style={styles.input}
            placeholder="TR00 0000 0000 0000 0000 0000 00"
            value={formatIbanWithSpaces('TR' + ibanRaw)}
            onChangeText={text => {
              let cleaned = text.replace(/\s+/g, '').toUpperCase();
              if (cleaned.startsWith('TR')) cleaned = cleaned.slice(2);
              cleaned = cleaned.replace(/[^0-9]/g, '').slice(0, 24);
              setIbanRaw(cleaned);
            }}
            autoCapitalize="characters"
            keyboardType="default"
            maxLength={34}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Ad Soyad</Text>
          <TextInput
            style={styles.input}
            placeholder="Ad Soyad"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Takma Ad</Text>
          <TextInput
            style={styles.input}
            placeholder="Takma Ad"
            value={nickname}
            onChangeText={setNickname}
            autoCapitalize="words"
            placeholderTextColor="#999"
          />
        </ScrollView>

        {/* GÖNDER BUTONU */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Gönderiliyor...' : 'İstek Gönder'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7fafd' // Light Pastel Background
  },
  container: {
    flex: 1,
    justifyContent: 'space-between'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#dce3ed' // Light Grey Border
  },
  backButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
   
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d5a80' // Primary Blue
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  label: {
    fontSize: 14,
    color: '#4a5568', // Secondary Text
    marginBottom: 6
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dce3ed', // Light Grey Border
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    color: '#000',
    marginBottom: 20
  },
  button: {
    backgroundColor: '#3d5a80', // Primary Blue
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20
  },
  buttonDisabled: {
    backgroundColor: '#dce3ed' // Light Grey for disabled
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
