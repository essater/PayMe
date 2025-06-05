// src/views/TransferSuccessScreen.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function TransferSuccessScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.successText}>✅ Transfer Başarılı!</Text>
      <Text style={styles.message}>İşleminiz başarıyla tamamlandı.</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          // Ana ekrana sıfırlı şekilde dön
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }]
          });
        }}
      >
        <Text style={styles.buttonText}>Ana Sayfaya Dön</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c2c97'
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 30
  },
  button: {
    backgroundColor: '#2c2c97',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
