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
  Image,
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
      Toast.show({ type: 'error', text1: 'Sşireler eşleşmiyor.' });
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
          <View style={styles.card}>
            <View style={styles.logoContainer}>
              <Image source={require('../../assets/PayMe_Logo4.png')} style={styles.logo} />
            </View>
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

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 10 }}>
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
    backgroundColor: '#3d5a80'
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 16,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  logoContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  logo: {
    width: 500,
    height: 200,
    resizeMode: 'contain',
    textAlign: 'center',
    marginBottom: -50,
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#3d5a80'
  },
  input: {
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 12
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 16
  },
  inputPassword: {
    flex: 1,
    height: 48
  },
  button: {
    backgroundColor: '#3d5a80',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  linkText: {
    color: 'Black',
    textAlign: 'center',
    fontSize: 14
  }
});
