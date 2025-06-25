import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Image,
  Alert
} from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../services/firebase';
import { VerificationViewModel } from '../viewmodels/VerificationViewModel';
import { Ionicons } from '@expo/vector-icons';

export default function VerificationScreen() {
  const navigation = useNavigation();
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsVerified(user.emailVerified);
      }
    });
    return unsubscribe;
  }, []);

  const handleCheckVerification = async () => {
    setVerifying(true);
    const result = await VerificationViewModel.checkVerificationStatus();

    if (result.error) {
      Alert.alert("Hata", result.error.message);
    } else if (result.verified) {
      setIsVerified(true);
      Alert.alert("Tebrikler", "Hesabınız onaylandı! Ana sayfaya yönlendiriliyorsunuz.");
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } else {
      Alert.alert("Beklemede", "E‐posta henüz doğrulanmamış. Lütfen e‐postanızı kontrol edin.");
    }

    setVerifying(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#3d5a80" />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image source={require('../../assets/PayMe_Logo4.png')} style={styles.logo} />
        </View>

        <Text style={styles.header}>Hesabınızı Doğrulayın</Text>

        <Text style={styles.infoText}>
          Kayıt sırasında verdiğiniz e‐posta adresine bir doğrulama bağlantısı gönderildi.
          Lütfen e‐postanızı açıp linke tıklayın. Ardından aşağıdaki butona basarak onay durumunu kontrol edebilirsiniz.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleCheckVerification}
          disabled={verifying}
        >
          {verifying ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {isVerified ? "Ana Sayfaya Git" : "Doğrulama Durumunu Kontrol Et"}
            </Text>
          )}
        </TouchableOpacity>

        {isVerified && (
          <Text style={styles.successText}>
            ✔️ Hesabınız onaylandı! Ana sayfaya yönlendiriliyorsunuz...
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3d5a80',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3d5a80',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#3d5a80',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  successText: {
    fontSize: 16,
    color: 'green',
    marginTop: 10,
    textAlign: 'center',
  },
});
