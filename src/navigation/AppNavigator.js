// src/navigation/AppNavigator.js

/*import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SignupScreen       from '../views/SignupScreen';
import LoginScreen        from '../views/LoginScreen';
import VerificationScreen from '../views/VerificationScreen';
import HomeScreen         from '../views/HomeScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Signup">
        <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Kayıt Ol' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Giriş Yap' }} />
        <Stack.Screen name="Verification" component={VerificationScreen} options={{ title: 'Doğrulama' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Ana Sayfa' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}*/
// src/navigation/AppNavigator.js

// src/navigation/AppNavigator.js

// src/navigation/AppNavigator.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SimpleScreen  from '../views/SimpleScreen';
import AnotherScreen from '../views/AnotherScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Simple">
        <Stack.Screen 
          name="Simple" 
          component={SimpleScreen} 
          options={{ title: 'Basit Ekran' }} 
        />
        <Stack.Screen 
          name="Another" 
          component={AnotherScreen} 
          options={{ title: 'Diğer Ekran' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}






