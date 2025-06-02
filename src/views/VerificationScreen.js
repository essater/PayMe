// src/views/VerificationScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { auth } from '../services/firebase';

export default function VerificationScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleCheckVerification = async () => {
    setLoading(true);
    try {
      // Kullanıcı bilgisini güncelle
      await auth.currentUser.reload();

      // E-posta doğrulandı mı?
      if (auth.currentUser.emailVerified) {
        Alert.alert('Başarılı', 'E-postanız doğrulandı! Ana sayfaya yönlendiriliyorsunuz.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        Alert.alert(
          'Doğrulama Bekleniyor',
          'E-postanızı henüz doğrulamamışsınız. Lütfen gelen kutunuzu kontrol edin.'
        );
      }
    } catch (error) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, Platform.OS === 'android' && { paddingTop: 50 }]}>
      <Text style={styles.header}>E-Posta Doğrulama</Text>
      <Text style={styles.infoText}>
        Kaydınızı tamamlamak için e-posta adresinize bir doğrulama bağlantısı gönderdik.  
        Lütfen e-postanızı açıp “Doğrula” butonuna tıklayın.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleCheckVerification}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Doğrulamayı Kontrol Et</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 24, marginBottom: 20, fontWeight: 'bold', textAlign: 'center' },
  infoText: { fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#333' },
  button: { backgroundColor: '#2c2c97', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 8 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
