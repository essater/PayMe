import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function TransferSuccessScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* ✔️ Büyük check görseli */}
      <Image
        source={require('../../assets/check.png')} // senin check görselin
        style={styles.successIcon}
        resizeMode="contain"
      />

      <Text style={styles.successText}>Transfer Başarılı!</Text>
      <Text style={styles.message}>İşleminiz başarıyla tamamlandı.</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }]
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
    backgroundColor: '#f7fafd', // Light Pastel Background
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  successIcon: {
    width: 100,
    height: 100,
    marginBottom: 24
  },
  successText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2b2d42', // Dark Heading Text
    marginBottom: 10,
    textAlign: 'center'
  },
  message: {
    fontSize: 18,
    color: '#4a5568', // Secondary Text
    marginBottom: 30,
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#3d5a80', // Primary Blue
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
