// src/views/SignupScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthViewModel } from '../viewmodels/AuthViewModel';
import Toast from 'react-native-toast-message';

export default function SignupScreen() {
  const navigation = useNavigation();

  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [email, setEmail] = useState('');
  const [birth, setBirth] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [isConfirmHidden, setIsConfirmHidden] = useState(true);
  const [loading, setLoading] = useState(false);

  const formatDateInput = (text) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length >= 5) {
      cleaned = cleaned.slice(0, 2) + '.' + cleaned.slice(2, 4) + '.' + cleaned.slice(4, 8);
    } else if (cleaned.length >= 3) {
      cleaned = cleaned.slice(0, 2) + '.' + cleaned.slice(2, 4);
    }
    setBirth(cleaned);
  };

  const handleSignup = async () => {
    if (!ad || !soyad || !email || !birth || !password || !confirm) {
      Toast.show({ type: 'error', text1: 'Lütfen tüm alanları doldurun.' });
      return;
    }

    if (password !== confirm) {
      Toast.show({ type: 'error', text1: 'Şifreler eşleşmiyor.' });
      return;
    }

    setLoading(true);

    const result = await AuthViewModel.signUpUser({
      name: ad,
      surname: soyad,
      email: email,
      birth: birth,
      password: password
    });

    setLoading(false);

    if (!result.success) {
      Toast.show({ type: 'error', text1: result.error.message });
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Kayıt Başarılı',
      text2: 'E-postanı kontrol et. Doğrulama linkine tıklayıp devam edebilirsin.'
    });

    navigation.reset({
      index: 0,
      routes: [{ name: 'Verification' }]
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.innerContainer}>
            <Text style={styles.header}>Kayıt Ol</Text>

            <TextInput style={styles.input} placeholder="Ad" value={ad} onChangeText={setAd} />
            <TextInput style={styles.input} placeholder="Soyad" value={soyad} onChangeText={setSoyad} autoCapitalize="words" />
            <TextInput style={styles.input} placeholder="E-posta" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Doğum Tarihi (GG.AA.YYYY)" keyboardType="numeric" maxLength={10} value={birth} onChangeText={formatDateInput} />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Şifre"
                secureTextEntry={isPasswordHidden}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setIsPasswordHidden(prev => !prev)}>
                <Ionicons name={isPasswordHidden ? 'eye-off-outline' : 'eye-outline'} size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Şifreyi Tekrar Yaz"
                secureTextEntry={isConfirmHidden}
                value={confirm}
                onChangeText={setConfirm}
              />
              <TouchableOpacity onPress={() => setIsConfirmHidden(prev => !prev)}>
                <Ionicons name={isConfirmHidden ? 'eye-off-outline' : 'eye-outline'} size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Kayıt Ol</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 15 }}>
              <Text style={styles.linkText}>Hesabınız var mı? Giriş yapın.</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f2f2'
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#f2f2f2'
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  header: {
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold',
    color: '#2c2c97'
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    marginBottom: 15
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    marginBottom: 15
  },
  inputPassword: {
    flex: 1,
    height: 48
  },
  button: {
    backgroundColor: '#2c2c97',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  linkText: {
    color: '#2c2c97',
    textAlign: 'center',
    fontSize: 14
  }
});
