import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebase';
import ProfileViewModel from '../viewmodels/ProfileViewModel';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { userData } = ProfileViewModel();

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      })
      .catch((error) => {
        Alert.alert('Hata', error.message);
      });
  };

  const handlePasswordChange = () => {
    navigation.navigate('ChangePassword');
  };

  const handleContactSupport = () => {
    navigation.navigate('ContactSupport');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Ionicons name="person-circle-outline" size={80} color="#1F2937" />
        <Text style={styles.nameText}>{userData?.name} {userData?.surname}</Text>
        <Text style={styles.emailText}>{auth.currentUser?.email}</Text>
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.option} onPress={handlePasswordChange}>
          <Ionicons name="key-outline" size={22} color="#1F2937" />
          <Text style={styles.optionText}>Şifreyi Değiştir</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleContactSupport}>
          <Ionicons name="help-circle-outline" size={22} color="#1F2937" />
          <Text style={styles.optionText}>Bize Ulaşın</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="red" />
          <Text style={[styles.optionText, { color: 'red' }]}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 80 },
  headerBox: { alignItems: 'center', marginBottom: 30 },
  nameText: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  emailText: { fontSize: 14, color: '#6B7280', marginTop: 4 },

  card: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },

  option: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },

  optionText: {
    marginLeft: 12, fontSize: 16, color: '#1F2937'
  }
});
