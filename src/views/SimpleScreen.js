// src/views/SimpleScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';

import { auth, database } from '../services/firebase';

export default function SimpleScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('🔥 [useEffect] auth.currentUser:', auth.currentUser);
    console.log('🔥 [useEffect] database instance:', database);
  }, []);

  const checkFirebase = async () => {
    setLoading(true);
    try {
      Alert.alert('Firebase Test', `auth.currentUser: ${auth.currentUser}`);
      console.log('🔎 [button] auth.currentUser inside checkFirebase:', auth.currentUser);
      console.log('🔎 [button] database inside checkFirebase:', database);
    } catch (error) {
      Alert.alert('Hata', error.message);
      console.log('❌ [button] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, Platform.OS === 'android' && { paddingTop: 50 }]}>
      <Text style={styles.header}>🚀 SimpleScreen Açıldı! (Test)</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={checkFirebase}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Firebase’i Test Et</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('Another')}
      >
        <Text style={styles.navButtonText}>DİĞER EKRANA GİT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header:       { fontSize: 20, marginBottom: 30, textAlign: 'center' },
  button:       { backgroundColor: '#2c2c97', padding: 15, borderRadius: 8, marginBottom: 15 },
  buttonText:   { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  navButton:    { backgroundColor: '#1e90ff', padding: 15, borderRadius: 8 },
  navButtonText:{ color: 'white', fontSize: 16, textAlign: 'center' },
});
