import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FloatingButton from '../components/floatingButton'; // Import Floating Button Component

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>WELCOME TO MAILER DAEMON APP!</Text>

      {/* Floating Button */}
      <FloatingButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', 
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default HomeScreen;
