// src/views/LoginScreen.js

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      // 1) E-posta/şifre ile giriş
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2) E-posta doğrulama kontrolü
      if (!user.emailVerified) {
        Alert.alert("Uyarı", "Lütfen önce e-postanızı doğrulayın.");
        return;
      }

      // 3) Başarılıysa Ana sayfaya geç
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert("Giriş Hatası", error.message);
    }
  };

  return (
    <View style={[styles.container, Platform.OS === 'android' && { paddingTop: 50 }]}>
      <Text style={styles.header}>Giriş Yap</Text>

      <TextInput
        style={styles.input}
        placeholder="E-posta"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Giriş Yap</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Hesabın yok mu? Kayıt Ol</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  header: { fontSize: 24, textAlign: 'center', marginBottom: 30, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15 },
  button: { backgroundColor: '#2c2c97', padding: 15, borderRadius: 8 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  link: { marginTop: 15, textAlign: 'center', color: '#2c2c97' }
});
