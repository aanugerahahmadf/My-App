import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function TermsConditionsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Terms & conditions</Text>
        <Text style={styles.text}>By using this application, you agree to comply with our terms and conditions. Please read them carefully.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  text: { fontSize: 16, color: '#4b5563', lineHeight: 24 },
});
