import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, FlatList, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';

const FloatingButton = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState("All");

  const hashtags = {
    "All": [],
    "Campus Daemon": [
      "https://www.facebook.com/share/p/1GkAVovcg8/",
      "https://www.facebook.com/share/p/15W2R4nyfr/",
      "https://www.facebook.com/share/p/14oD9z3o9u/",
      "https://www.facebook.com/share/p/1F1ddQArqb/",
      "https://www.facebook.com/share/p/1Be5pM2BL8/",
      "https://www.facebook.com/share/p/1AjsouPZMV/",
      "https://www.facebook.com/share/p/1FDtrFiDKy/",
      "https://www.facebook.com/share/p/14r1WtEv9G/",
    ],
    "Placement Daemon": [
      "https://www.facebook.com/share/p/1BWfaGTeF8/",
      "https://www.facebook.com/share/p/15hGf5kkxG/",
      "https://www.facebook.com/share/p/1HUXzGsm7P/",
      "https://www.facebook.com/share/p/1BFPBFhZ7p/",
      "https://www.facebook.com/share/p/1HJPhJC16L/",
      "https://www.facebook.com/share/p/12B5WH93VYg/",
      "https://www.facebook.com/share/p/14mCLyYAoK/",
      "https://www.facebook.com/share/p/14xKhzafnU4/",
    ],
    "Help Daemon": [
      "https://www.facebook.com/share/p/1BrHRUupUW/",
      "https://www.facebook.com/share/p/1EvH5vkHrL/",
      "https://www.facebook.com/share/p/1B8xojpY3W/",
      "https://www.facebook.com/share/p/1BBPvQJsmm/",
      "https://www.facebook.com/share/p/1E3zMvwfSm/",
      "https://www.facebook.com/share/p/12Bxfni45ym/",
    ],
    "MD Lost And Found": [
      "https://www.facebook.com/share/p/1XuppXY5kX/",
      "https://www.facebook.com/share/p/18CTBaXMMJ/",
      "https://www.facebook.com/share/p/1BWpEJi6mf/",
      "https://www.facebook.com/share/p/1B3NnN5VX7/",
      "https://www.facebook.com/share/p/1BSfHuVT4i/",
      "https://www.facebook.com/share/p/15vLftz42R/",
      "https://www.facebook.com/share/p/15svMwonXP/",
    ],
    "BC Daemon": [
      "https://www.facebook.com/share/p/15ww8quPy5/",
      "https://www.facebook.com/share/p/12J3sztgGso/",
      "https://www.facebook.com/share/p/15rcT7kBG9/",
    ],
    "Penned Daemon": [
      "https://www.facebook.com/share/p/14yPdxf8LY/",
    ],
    "Captura do Daemon": [
      "https://www.facebook.com/share/r/1CtKbCt4AT/",
      "https://www.facebook.com/share/r/198TWAY2nv/",
      "https://www.facebook.com/share/r/1DMx9MH8jK/",
      "https://www.facebook.com/share/r/14yUTk3E9P/",
      "https://www.facebook.com/share/r/15Y4rxV4sf/",
      "https://www.facebook.com/share/r/1NcyFan6qY/",
    ],
    "Electo Daemon": [
      "https://www.facebook.com/share/p/15bQ7RpFNC/",
    ],
  };

  const handlePress = (item) => {
    setSelectedItem(item);
    setModalVisible(false);
    if (hashtags[item] && hashtags[item].length > 0) {
      hashtags[item].forEach((link) => Linking.openURL(link));
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.floatingButton} onPress={() => setModalVisible(true)}>
        <Feather name={modalVisible ? "check" : "hash"} size={30} color="#ff6600" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay} onTouchEnd={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <FlatList
              data={Object.keys(hashtags)}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.bulletContainer} onPress={() => handlePress(item)}>
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
    width: '60%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 120,
    marginRight: 50,
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