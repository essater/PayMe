// src/views/SignupScreen.js

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AuthViewModel } from '../viewmodels/AuthViewModel';

export default function SignupScreen() {
  const navigation = useNavigation();

  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [email, setEmail] = useState('');
  const [birth, setBirth] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (password !== confirm) {
      Alert.alert("Hata", "Şifreler eşleşmiyor");
      return;
    }

    setLoading(true);
    console.log("🔄 handleSignup başladı");

    const result = await AuthViewModel.signUpUser({
      name: ad,
      surname: soyad,
      email: email,
      birth: birth,
      password: password
    });

    if (result.success) {
      Alert.alert(
        "Kayıt Başarılı",
        "E-postanı kontrol et. Doğrulama linkine tıklayıp devam edebilirsin."
      );
      navigation.reset({
        index: 0,
        routes: [{ name: 'Verification' }]
      });
    } else {
      console.error("❌ Kayıt Hatası:", result.error);
      Alert.alert("Hata", result.error.message);
    }

    setLoading(false);
  };

  return (
    <View style={[styles.container, Platform.OS === 'android' && { paddingTop: 50 }]}>
      <Text style={styles.header}>Kayıt Ol</Text>

      <TextInput style={styles.input} placeholder="Ad" value={ad} onChangeText={setAd} />
      <TextInput style={styles.input} placeholder="Soyad" value={soyad} onChangeText={setSoyad} />
      <TextInput
        style={styles.input}
        placeholder="E-posta Adresi"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput style={styles.input} placeholder="Doğum Tarihi" value={birth} onChangeText={setBirth} />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Şifreyi Tekrar Yaz"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Kayıt Ol</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 15 }}>
        <Text style={styles.linkText}>Hesabın var mı? Girişe dön</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  header: { fontSize: 24, textAlign: 'center', marginBottom: 30, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15 },
  button: { backgroundColor: '#2c2c97', padding: 15, borderRadius: 8 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  linkText: { color: '#2c2c97', textAlign: 'center', textDecorationLine: 'underline' }
});
