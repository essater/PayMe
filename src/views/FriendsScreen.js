// src/views/FriendsScreen.js

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FriendsViewModel } from '../viewmodels/FriendsViewModel';
import { auth, firestore } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';


export default function FriendsScreen({ navigation }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  

  // --- Düzenleme modal state’leri ---
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentFriend, setCurrentFriend] = useState(null);
  const [nickname, setNickname] = useState('');
  const [name, setName] = useState('');
  const [iban, setIban] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = FriendsViewModel.subscribeFriends(list => {
      setFriends(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  useEffect(() => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const notifRef = collection(firestore, 'users', uid, 'notifications');
  const q = query(notifRef, where('read', '==', false));
  const unsub = onSnapshot(q, snap => {
    setUnreadCount(snap.size);
  });
  return unsub;
}, []);

  const toggleExpand = id => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleSendMoney = friend => {
    navigation.navigate('Transfer', {
      recipientIban: friend.iban,
      recipientName: friend.name
    });
    setExpandedId(null);
  };

  const handleRequestMoney = friend => {
    navigation.navigate('RequestMoney', {
      recipientIban: friend.iban,
      recipientName: friend.name
    });
    setExpandedId(null);
  };

  // --- Eski handleEdit yerine modal açıyoruz ---
  const openEdit = friend => {
    setCurrentFriend(friend);
    setNickname(friend.nickname);
    setName(friend.name);
    setIban(friend.iban);
    setEditModalVisible(true);
    setExpandedId(null);
  };

  const saveEdit = async () => {
    if (!nickname.trim() || !name.trim() || !iban.trim()) {
      return Alert.alert('Eksik bilgi', 'Lütfen tüm alanları doldurun.');
    }
    setSaving(true);
    try {
      await FriendsViewModel.updateFriend(currentFriend.id, {
        nickname: nickname.trim(),
        name: name.trim(),
        iban: iban.trim()
      });
      setEditModalVisible(false);
    } catch (err) {
      Alert.alert('Hata', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = friend => {
    Alert.alert(
      'Arkadaş Sil',
      `${friend.nickname} silinecek, emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () =>
            FriendsViewModel.removeFriend(friend.id).catch(() =>
              Alert.alert('Hata', 'Silme işlemi başarısız oldu.')
            )
        }
      ]
    );
    setExpandedId(null);
  };

  const renderItem = ({ item }) => {
    const isExpanded = item.id === expandedId;
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.friendInfo}>
            <Image
  source={require('../../assets/account_icon.png')}
  style={styles.avatarImage}
/>
            <View style={styles.textContainer}>
              <Text style={styles.nickname}>{item.nickname}</Text>
              <Text style={styles.fullName}>{item.name}</Text>
              <Text style={styles.iban}>{item.iban}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => toggleExpand(item.id)}
            style={styles.iconBtn}
          >
            <Ionicons
              name={isExpanded ? 'chevron-up-outline' : 'ellipsis-vertical'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        {isExpanded && (
          <View style={styles.actionsInline}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.sendBtn]}
              onPress={() => handleSendMoney(item)}
            >
              <Text style={styles.actionText}>Para Gönder</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.requestBtn]}
              onPress={() => handleRequestMoney(item)}
            >
              <Text style={styles.actionText}>Para İste</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.editBtn]}
              onPress={() => openEdit(item)}             // ← burada
            >
              <Text style={styles.actionText}>Düzenle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => handleDelete(item)}
            >
              <Text style={styles.actionDeleteText}>Sil</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2c2c97" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#3d5a80" />
        </TouchableOpacity>
        <Text style={styles.title}>Arkadaşlarım</Text>
        <View style={styles.rightButtons}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddFriend')}
          >
            <Ionicons name="person-add-outline" size={18} color="#3d5a80" />
            
            <Text style={styles.addText}>Arkadaş Ekle</Text>
          </TouchableOpacity>
          <TouchableOpacity
  style={styles.notificationButton}
  onPress={() => navigation.navigate('Notifications')}
>
  <View>
    <Image source={require('../../assets/bell.png')} style={{ width: 24, height: 24, tintColor: '#3d5a80' }} />
    {unreadCount > 0 && (
      <View style={styles.unreadBadge} />
    )}
  </View>
</TouchableOpacity>
        </View>
      </View>

      {/* Liste */}
      <FlatList
        data={friends}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={<Text style={styles.empty}>Arkadaş listeniz boş.</Text>}
      />

      {/* Düzenleme Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Arkadaş Düzenle</Text>

            <Text style={styles.label}>Takma Ad</Text>
            <TextInput
              style={styles.input}
              value={nickname}
              onChangeText={setNickname}
            />

            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>IBAN</Text>
            <TextInput
              style={styles.input}
              value={iban}
              onChangeText={setIban}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={saveEdit}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveText}>Kaydet</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafd', // Light Pastel Background
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#dce3ed' // Light Grey Border
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d5a80', // Dark Heading
    marginLeft: 8
  },
  rightButtons: { flexDirection: 'row', alignItems: 'center' },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3d5a80', // Primary Blue
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 12
  },
  addText: { marginLeft: 6, color: '#3d5a80', fontWeight: '600' },
  iconBtn: { marginLeft: 12, padding: 4 },

  list: { padding: 16 },
  empty: { marginTop: 40, textAlign: 'center', color: '#4a5568' }, // Secondary Text

  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  textContainer: { marginLeft: 12, flex: 1 },
  nickname: { fontSize: 18, fontWeight: '600', color: '#2b2d42' }, // Dark Heading
  fullName: { fontSize: 14, color: '#4a5568', marginTop: 4 }, // Secondary Text
  iban: { fontSize: 12, color: '#4a5568', marginTop: 2 }, // Light Grey Border

  actionsInline: { marginTop: 12 },
  actionBtn: {
    backgroundColor: '#3d5a80', // Button Blue
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center'
  },
  sendBtn: {},
  requestBtn: {},
  editBtn: {},
  deleteBtn: { backgroundColor: '#d32f2f' },
  actionText: { color: '#fff', fontWeight: '600' },
  actionDeleteText: { color: '#fff', fontWeight: '600' },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
  },
  modalContent: {
    padding: 20
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, textAlign: 'center', color: '#2b2d42' },
  label: { fontSize: 14, marginTop: 8, color: '#2b2d42' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#dbe2ef' // Modal Divider Lines
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 8
  },
  cancelButton: {
    backgroundColor: '#dce3ed'
  },
  cancelText: {
    color: '#4a5568',
    fontWeight: '600'
  },
  saveButton: {
    backgroundColor: '#3d5a80'
  },
  saveText: {
    color: '#fff',
    fontWeight: '600'
  },

  notificationButton: {
  marginLeft: 12,
  padding: 4
},
unreadBadge: {
  position: 'absolute',
  top: -3,
  right: -3,
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: '#d32f2f'
},
avatarImage: {
  width: 40,
  height: 40,
  borderRadius: 20,
  resizeMode: 'contain',
  marginRight: 8
}
});

