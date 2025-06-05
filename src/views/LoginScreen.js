import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        Alert.alert("Uyarı", "Lütfen e‐posta adresinizi doğrulayın.");
      }
    } catch (error) {
      console.log("❌ Login Hatası:", error.code, error.message);
      Alert.alert("Giriş Hatası", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, Platform.OS === 'android' && { paddingTop: 50 }]}>
      <Text style={styles.header}>Giriş Yap</Text>

      <TextInput
        style={styles.input}
        placeholder="E‐posta Adresi"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Şifre"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Giriş Yap</Text>
        )}
      </TouchableOpacity>

      {/* Şifreni mi unuttun? */}
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotText}>Şifreni mi unuttun?</Text>
      </TouchableOpacity>

      {/* Kayıt Ol */}
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.linkText}>Hesabın yok mu? Kayıt Ol</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  header:     { fontSize: 24, textAlign: 'center', marginBottom: 30, fontWeight: 'bold' },
  input:      { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15 },
  button:     { backgroundColor: '#2c2c97', padding: 15, borderRadius: 8 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  forgotText: { color: '#2c2c97', textAlign: 'center', marginTop: 12 },
  linkText:   { color: '#2c2c97', textAlign: 'center', marginTop: 6 }
});
