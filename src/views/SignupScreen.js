// src/views/SignupScreen.js

import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Buradan “auth” ve “database” import edilmeli:
import { auth, database } from '../services/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { ref, set } from 'firebase/database';

export default function SignupScreen() {
  const navigation = useNavigation();

  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [email, setEmail] = useState('');
  const [birth, setBirth] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSignup = async () => {
    if (password !== confirm) {
      Alert.alert("Hata", "Şifreler uyuşmuyor");
      return;
    }

    try {
      // 1) Kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2) Realtime DB'e kaydet
      await set(ref(database, 'users/' + user.uid), {
        ad,
        soyad,
        email,
        birth
      });

      // 3) E-posta doğrulama maili gönder
      await sendEmailVerification(user);

      Alert.alert(
        "Başarılı",
        "Kayıt tamamlandı. E-posta adresinize gönderilen doğrulama linkini tıklayın."
      );

      // 4) Login ekranına yönlendir
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert("Kayıt Hatası", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Kayıt Ol</Text>
      <TextInput style={styles.input} placeholder="Ad" onChangeText={setAd} value={ad} />
      <TextInput style={styles.input} placeholder="Soyad" onChangeText={setSoyad} value={soyad} />
      <TextInput 
        style={styles.input} 
        placeholder="E-posta Adresi" 
        keyboardType="email-address" 
        onChangeText={setEmail} 
        value={email} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Doğum Tarihi (GG/AA/YYYY)" 
        onChangeText={setBirth} 
        value={birth} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Şifre" 
        secureTextEntry 
        onChangeText={setPassword} 
        value={password} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Şifreyi Tekrar Yaz" 
        secureTextEntry 
        onChangeText={setConfirm} 
        value={confirm} 
      />
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Kayıt Ol</Text>
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
});
