import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { auth, firestore } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import { View, Text, Image } from 'react-native';

import { NotificationViewModel } from '../viewmodels/NotificationViewModel';

// Screens
import SignupScreen from '../views/SignupScreen';
import LoginScreen from '../views/LoginScreen';
import VerificationScreen from '../views/VerificationScreen';
import HomeScreen from '../views/HomeScreen';
import TransferScreen from '../views/TransferScreen';
import TransferSuccessScreen from '../views/TransferSuccessScreen';
import TransactionScreen from '../views/TransactionScreen';
import QRScreen from '../views/QRScreen';
import ProfileScreen from '../views/ProfileScreen';
import FriendsScreen from '../views/FriendsScreen';
import RequestMoneyScreen from '../views/RequestMoneyScreen';
import ChangePasswordScreen from '../views/ChangePasswordScreen';
import ContactSupportScreen from '../views/ContactSupportScreen';
import ForgotPasswordScreen from '../views/ForgotPasswordScreen';
import NotificationsScreen from '../views/NotificationsScreen';
import AddFriendScreen from '../views/AddFriendScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const toastConfig = {
  success: ({ text1, text2 }) => (
    <View style={{ height: 60, width: '90%', backgroundColor: '#2c2c97', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, alignSelf: 'center' }}>
      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{text1}</Text>
      {text2 ? <Text style={{ color: 'white', fontSize: 13 }}>{text2}</Text> : null}
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={{ height: 60, width: '90%', backgroundColor: '#d32f2f', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, alignSelf: 'center' }}>
      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{text1}</Text>
      {text2 ? <Text style={{ color: 'white', fontSize: 13 }}>{text2}</Text> : null}
    </View>
  )
};

function MainTabs() {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const notifRef = collection(firestore, 'users', uid, 'notifications');
    const q = query(notifRef, where('read', '==', false));
    const unsubscribe = onSnapshot(q, snapshot => {
      setHasUnread(!snapshot.empty);
    });
    return unsubscribe;
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let iconSource;
          if (route.name === 'Ana Sayfa') iconSource = require('../../assets/home.png');
          else if (route.name === 'Arkadaşlar') iconSource = require('../../assets/friends.png');
          else if (route.name === 'QR') iconSource = require('../../assets/qr_code.png');
          else if (route.name === 'Hesabım') iconSource = require('../../assets/account_icon.png');
      

          return (
            <View>
              <Image source={iconSource} style={{ width: 24, height: 24, tintColor: focused ? '#3d5a80' : '#999' }} />
              {route.name === 'Bildirimler' && hasUnread && (
                <View style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: 'red' }} />
              )}
            </View>
          );
        },
        tabBarActiveTintColor: '#3d5a80',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0, elevation: 10 }
      })}
    >
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
      <Tab.Screen name="Arkadaşlar" component={FriendsScreen} />
      <Tab.Screen name="QR" component={QRScreen} />
      <Tab.Screen name="Hesabım" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    NotificationViewModel.init();
    return () => NotificationViewModel.cleanup();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setInitialRoute(user.emailVerified ? 'Main' : 'Verification');
      } else {
        setInitialRoute('Login');
      }
    });
    return unsubscribe;
  }, []);

  if (!initialRoute) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Verification" component={VerificationScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Transfer" component={TransferScreen} />
        <Stack.Screen name="TransferSuccess" component={TransferSuccessScreen} />
        <Stack.Screen name="Transaction" component={TransactionScreen} />
        <Stack.Screen name="RequestMoney" component={RequestMoneyScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="QRScreen" component={QRScreen} />
        <Stack.Screen name="AddFriend" component={AddFriendScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Navigator>
      <Toast config={toastConfig} position="top" topOffset={60} />
    </NavigationContainer>
  );
}
