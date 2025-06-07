import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

import { auth } from '../services/firebase';
import { VerificationViewModel } from '../viewmodels/VerificationViewModel';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20
  },
  container: {
    alignItems: 'center'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#333'
  },
  button: {
    backgroundColor: '#2c2c97',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  successText: {
    fontSize: 16,
    color: 'green',
    marginTop: 10,
    textAlign: 'center'
  }
});
