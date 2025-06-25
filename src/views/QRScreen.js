import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { auth } from "../services/firebase";
import { AuthViewModel } from "../viewmodels/AuthViewModel";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from "../services/firebase";

export default function QRScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);
  const [activeTab, setActiveTab] = useState("scanner"); // 'scanner' veya 'qrcode'
  const [iban, setIban] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    requestPermission();

    // Kullanıcı bilgisi ve IBAN çekme
    const currentUser = auth.currentUser;
    if (currentUser) {
      AuthViewModel.getUserData(currentUser.uid).then((res) => {
        if (res.success && res.data.iban) {
          setIban(res.data.iban);
        } else {
          Alert.alert("Hata", "Kullanıcı IBAN bilgisi alınamadı.");
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Kameraya erişim izni gerekiyor.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>İzin Ver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#2c2c97" />
      </View>
    );
  }

 const handleBarcodeScanned = async ({ data }) => {
  if (hasScanned) return;

  const scannedIban = data.trim().replace(/\s+/g, '');
  console.log("Temizlenmiş QR IBAN:", scannedIban);
  setHasScanned(true);

  try {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('iban', '==', scannedIban));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      Alert.alert('Hata', 'Geçersiz veya kayıtlı olmayan IBAN kodu.');
    } else {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      navigation.navigate('Transfer', {
        recipientIban: userData.iban,
        recipientName: userData.name + ' ' + userData.surname,
      });
    }
  } catch (error) {
    console.error("Firestore Hatası:", error);
    Alert.alert('Hata', 'Kullanıcı bilgisi alınamadı.');
  }

  setTimeout(() => setHasScanned(false), 3000); // 3 saniye sonra tekrar taramaya izin ver
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "scanner" && styles.activeTabButton]}
          onPress={() => setActiveTab("scanner")}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === "scanner" && styles.activeTabText]}>
            QR Okut
          </Text>
        </TouchableOpacity>

        <Text style={styles.separator}>|</Text>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "qrcode" && styles.activeTabButton]}
          onPress={() => setActiveTab("qrcode")}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === "qrcode" && styles.activeTabText]}>
            QR Kodum
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "scanner" ? (
        <View style={styles.cameraContainer}>
          <CameraView
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
            style={styles.camera}
          />
        </View>
      ) : (
        <View style={styles.qrContainer}>
          {iban ? (
            <>
              <QRCode value={iban} size={200} />
              <Text style={styles.ibanText}>{iban}</Text>
            </>
          ) : (
            <Text style={{ color: "#999" }}>IBAN bilgisi alınamadı</Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fafd" // lightBackground
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "rgba(61, 90, 128, 0.1)", // primaryBlue with transparency
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeTabButton: {
    borderRadius: 12,
    backgroundColor: "rgba(61, 90, 128, 0.3)", // primaryBlue with stronger opacity
  },
  tabText: {
    color: "#3d5a80", // primaryBlue
    fontWeight: "500",
    fontSize: 14,
    opacity: 0.6,
  },
  activeTabText: {
    fontWeight: "700",
    opacity: 1,
  },
  separator: {
    color: "#3d5a80", // primaryBlue
    marginHorizontal: 4,
    fontWeight: "600",
    fontSize: 14,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  qrContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  ibanText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#3d5a80", // primaryBlue
  },
  message: {
    textAlign: "center",
    padding: 20,
    color: "#4a5568", // secondaryText
  },
  permissionButton: {
    backgroundColor: "#3d5a80", // buttonBlue
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "center",
  },
  permissionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});