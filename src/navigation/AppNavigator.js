// src/navigation/AppNavigator.js

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Toast from 'react-native-toast-message';
import { View, Text } from 'react-native';

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
import CardsScreen from '../views/CardsScreen';
import ChangePasswordScreen from '../views/ChangePasswordScreen';
import ContactSupportScreen from '../views/ContactSupportScreen';
import ForgotPasswordScreen from '../views/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Özel Toast Bileşeni
const toastConfig = {
  success: ({ text1, text2 }) => (
    <View style={{
      height: 60,
      width: '90%',
      backgroundColor: '#2c2c97',
      borderRadius: 10,
      paddingHorizontal: 16,
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 4,
      alignSelf: 'center'
    }}>
      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{text1}</Text>
      {text2 ? <Text style={{ color: 'white', fontSize: 13 }}>{text2}</Text> : null}
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={{
      height: 60,
      width: '90%',
      backgroundColor: '#d32f2f',
      borderRadius: 10,
      paddingHorizontal: 16,
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 4,
      alignSelf: 'center'
    }}>
      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{text1}</Text>
      {text2 ? <Text style={{ color: 'white', fontSize: 13 }}>{text2}</Text> : null}
    </View>
  )
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Ana Sayfa') iconName = 'home-outline';
          else if (route.name === 'Kartlar') iconName = 'card-outline';
          else if (route.name === 'QR') iconName = 'qr-code-outline';
          else if (route.name === 'Hesabım') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2c2c97',
        tabBarInactiveTintColor: 'gray'
      })}
    >
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
      <Tab.Screen name="Kartlar" component={CardsScreen} />
      <Tab.Screen name="QR" component={QRScreen} />
      <Tab.Screen name="Hesabım" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.emailVerified) {
          setInitialRoute('Main');
        } else {
          setInitialRoute('Verification');
        }
      } else {
        setInitialRoute('Signup');
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
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="QRScreen" component={QRScreen} />
      </Stack.Navigator>

      {/* ✅ Toast bileşeni (özelleştirilmiş konum ve stil ile) */}
      <Toast config={toastConfig} position="top" topOffset={60} />
    </NavigationContainer>
  );
}
