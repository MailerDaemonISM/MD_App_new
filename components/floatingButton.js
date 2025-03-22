import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';

const FloatingButton = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState("All");

  const hashtags = [
    "All",
    "Campus Daemon",
    "Placement Daemon",
    "Penned Daemon",
    "Captura do Daemon",
    "Epoch Daemon",
    "Electo Daemon",
    "BC Daemon",
  ];

  return (
    <>
      {/* Floating Button */}
      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={() => setModalVisible(true)}
      >
        <Feather name={modalVisible ? "check" : "hash"} size={30} color="#ff6600" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay} onTouchEnd={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            {/* List of Hashtags */}
            <FlatList
              data={hashtags}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.bulletContainer}
                  onPress={() => {
                    setSelectedItem(item);
                    setModalVisible(false);
                  }}
                >
                  <View style={styles.bulletWrapper}>
                    <View style={styles.bulletOuter}>
                      {selectedItem === item && <View style={styles.bulletInner} />}
                    </View>
                    <Text style={styles.radioText}>{item}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 60,
    right: 30,
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalContainer: {
    width: '60%', // smaller width
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 120,
    marginRight: 50, // positioned more to the right-bottom
    elevation: 5,
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  bulletWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletOuter: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#EEA052',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bulletInner: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#EEA052',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
});

export default FloatingButton;
