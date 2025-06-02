// src/views/HomeScreen.js

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={[styles.container, Platform.OS === 'android' && { paddingTop: 50 }]}>
      <Text style={styles.header}>Hoş Geldiniz!</Text>
      <Text style={styles.text}>Firebase ile e-posta doğrulamalı kayıt & Giriş başarılı.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, marginBottom: 15, fontWeight: 'bold' },
  text: { fontSize: 16, textAlign: 'center' }
});
