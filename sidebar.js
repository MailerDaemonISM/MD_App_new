// SidebarOverlay.js

import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Import MaterialIcons from expo/vector-icons
import { useNavigation } from '@react-navigation/native';
import HomeScreen from './src/HomePage';
import MDPosts from './src/HomePage';

const SidebarOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navigateToScreen = (screenName) => {
    toggleSidebar();
    navigation.navigate(screenName);
  };

  const goBack = () => {
    toggleSidebar();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isOpen}
        onRequestClose={() => {
          toggleSidebar();
        }}
      >
        <View style={styles.sidebar}>
          <TouchableOpacity onPress={goBack}>
            <MaterialIcons name="arrow-back" size={44} color="black" style={styles.backButton} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateToScreen('HomeScreen')}>
            <Text>HomeScreen</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateToScreen('MDPosts')}>
            <Text>MDPosts</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateToScreen('Screen3')}>
            <Text>MDHashes</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateToScreen('Placementor')}>
            <Text>Screen 4</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateToScreen('Screen5')}>
            <Text>Screen 5</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <TouchableOpacity onPress={toggleSidebar} style={styles.menuIcon}>
        <MaterialIcons name="menu" size={44} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebar: {
    flex: 1,
    backgroundColor: 'white',
    width: '80%',
    padding: 20,
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
  },
  menuIcon: {
    position: 'absolute',
    left: 10,
    top: 20,
  },
  backButton: {
    marginBottom: 10,
  },
});

export default SidebarOverlay;
