// src/views/HomeScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { auth } from '../services/firebase';
import { AuthViewModel } from '../viewmodels/AuthViewModel';

export default function HomeScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mevcut oturum açmış kullanıcının UID’sini al
    const currentUser = auth.currentUser;
    if (!currentUser) {
      // Eğer kullanıcı yoksa zorunlu olarak Login’e yönlendir (ya da hata göster)
      return;
    }

    // Firestore’dan kullanıcı verilerini (ve kart bilgisini) al
    AuthViewModel.getUserData(currentUser.uid)
      .then(result => {
        if (result.success) {
          setUserData(result.data);
        } else {
          console.error("❌ Kullanıcı verisi alınamadı:", result.error);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2c2c97" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.centered}>
        <Text>Kullanıcı verisi bulunamadı.</Text>
      </View>
    );
  }

  // userData şöyle bir objedir:
  // {
  //   name: "esat",
  //   surname: "erbay",
  //   email: "erbay.essa@gmail.com",
  //   birth: "15/10/2001",
  //   card: {
  //     cardNumber: "4539 6823 1923 4565",
  //     expiryMonth: "07",
  //     expiryYear: "2028",
  //     cvv: "421",
  //     balance: 0
  //   }
  // }

  const { card } = userData;

  return (
    <View style={styles.container}>
      {/* Dijital kart tasarımını buraya ekleyebilirsin. Aşağıda basit bir örnek */}
      <View style={styles.cardContainer}>
        <Text style={styles.cardNumber}>{card.cardNumber}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Expiry:</Text>
          <Text style={styles.value}>{card.expiryMonth}/{card.expiryYear.slice(-2)}</Text>
          <Text style={[styles.label, { marginLeft: 20 }]}>CVV:</Text>
          <Text style={styles.value}>{card.cvv}</Text>
        </View>
        <Text style={styles.balanceLabel}>Bakiye:</Text>
        <Text style={styles.balanceValue}>{card.balance.toFixed(2)} ₺</Text>
      </View>

      {/* İleride başka ana sayfa içerikleri eklenebilir */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardContainer: {
    backgroundColor: '#1e1e7e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30
  },
  cardNumber: {
    color: 'white',
    fontSize: 20,
    letterSpacing: 2,
    marginBottom: 15
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  label: {
    color: 'white',
    fontSize: 14,
    marginRight: 4
  },
  value: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  balanceLabel: {
    color: 'white',
    fontSize: 14
  },
  balanceValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold'
  }
});
