import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Linking } from 'react-native';

const UpdateModal = ({ visible, force }) => {
  const handleUpdate = () => {
    Linking.openURL('https://play.google.com/store/apps/details?id=com.yourcompany.mdapp');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Update Available 🚀</Text>
          <Text style={styles.desc}>
            A new version is available with improvements and bug fixes.
          </Text>

          <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate}>
            <Text style={styles.updateText}>Update Now</Text>
          </TouchableOpacity>

          {!force && (
            <TouchableOpacity style={styles.laterBtn}>
              <Text style={styles.laterText}>Later</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default UpdateModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  desc: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  updateBtn: {
    backgroundColor: '#0079D3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 10,
  },
  updateText: {
    color: '#fff',
    fontWeight: '700',
  },
  laterBtn: {
    padding: 10,
  },
  laterText: {
    color: '#888',
  },
});