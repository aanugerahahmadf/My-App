import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

interface MidtransPaymentProps {
  visible: boolean;
  snapToken: string;
  onClose: () => void;
  onSuccess: (result: any) => void;
  onPending: (result: any) => void;
  onError: (error: any) => void;
}

export function MidtransPayment({ visible, snapToken, onClose, onSuccess, onPending, onError }: MidtransPaymentProps) {
  // Use Midtrans Snap URL
  const snapUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`;

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    if (url.includes('finish') || url.includes('callback')) {
      // Logic to parse results from URL if necessary
      onSuccess({ status: 'success' });
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Pembayaran Midtrans</Text>
        </View>
        <WebView
          source={{ uri: snapUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
