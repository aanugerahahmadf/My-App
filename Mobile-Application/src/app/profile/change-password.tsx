import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';

export default function ChangePasswordScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current password</Text>
          <TextInput style={styles.input} secureTextEntry placeholder="********" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New password</Text>
          <TextInput style={styles.input} secureTextEntry placeholder="********" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm new password</Text>
          <TextInput style={styles.input} secureTextEntry placeholder="********" />
        </View>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Save password</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  form: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16 },
  button: { backgroundColor: '#0a7ea4', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
