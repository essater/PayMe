import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import SignupScreen from '../views/SignupScreen';
import LoginScreen from '../views/LoginScreen';
import VerificationScreen from '../views/VerificationScreen';
import HomeScreen from '../views/HomeScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.emailVerified) {
          setInitialRoute('Home');
        } else {
          setInitialRoute('Verification');
        }
      } else {
        // Eğer kullanıcı yoksa -> Signup ekranı
        setInitialRoute('Signup'); // veya Login
      }
    });

    return unsubscribe;
  }, []);

  if (!initialRoute) {
    return null; // veya splash screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Kayıt Ol' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Giriş Yap' }} />
        <Stack.Screen name="Verification" component={VerificationScreen} options={{ title: 'Doğrulama' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Ana Sayfa' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}










