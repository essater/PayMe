


// App.js
/*import React from 'react';
import { View, Text } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>🤖 Test Ekranı Açıldı!</Text>
    </View>
  );
}*/

// App.js

// 1) Polyfill’ler mutlaka en üste:
//    - react-native-get-random-values: crypto.getRandomValues polyfill
//    - react-native-url-polyfill/auto: URL, URLSearchParams polyfill
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return <AppNavigator />;
}



