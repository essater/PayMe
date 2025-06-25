import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '../services/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import Toast from 'react-native-toast-message';

export default function ContactSupportScreen() {
  const [message, setMessage] = useState('');
  const navigation = useNavigation();

  const handleSend = async () => {
    if (!message.trim()) {
      Toast.show({ type: 'error', text1: 'Lütfen bir mesaj yazın.' });
      return;
    }

    try {
      await addDoc(collection(firestore, 'support_messages'), {
        email: auth.currentUser?.email || 'Bilinmiyor',
        message,
        createdAt: serverTimestamp()
      });

      Toast.show({
        type: 'success',
        text1: 'Mesajınız başarıyla gönderildi!',
        visibilityTime: 2000
      });

      setMessage('');
    } catch (error) {
      console.error('Firestore Hatası:', error);
      Toast.show({ type: 'error', text1: 'Gönderim başarısız oldu.' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Geri Butonu */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#3d5a80" />
      </TouchableOpacity>

      <Text style={styles.header}>Bize Ulaşın</Text>
      <Text style={styles.subText}>
        Görüş, öneri ya da şikayetlerinizi bizimle paylaşın. En kısa sürede size dönüş yapılacaktır.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Mesajınızı buraya yazın..."
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      <TouchableOpacity style={styles.button} onPress={handleSend}>
        <Text style={styles.buttonText}>Gönder</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 110,
    backgroundColor: '#f7fafd', // pastel arka plan
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    color: '#3d5a80' // koyu başlık
  },
  subText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#dce3ed',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#2b2d42',
    marginBottom: 20
  },
  button: {
    backgroundColor: '#3d5a80',
    padding: 15,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  }
});