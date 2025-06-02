// src/views/AnotherScreen.js

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function AnotherScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>✅ AnotherScreen Açıldı!</Text>
      <Button
        title="SimpleScreen'e Dön"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
