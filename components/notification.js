import React, { useState } from 'react';
import { TouchableOpacity, View, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons'; // for bell icon

export default function Notification() {
  const [enabled, setEnabled] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState(null);

  const handleToggle = async () => {
    if (!enabled) {
      // Turn ON notifications
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission not granted for notifications!');
          return;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync();
        const token = tokenData.data;
        console.log('Expo Push Token:', token);
        setExpoPushToken(token);

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
          });
        }

        Alert.alert('Notifications Enabled!', `Token: ${token.slice(0, 10)}...`);
        setEnabled(true);
      } catch (error) {
        console.error('Error setting up notifications:', error);
        Alert.alert('Error setting up notifications', error.message);
      }
    } else {
      // Turn OFF notifications
      setEnabled(false);
      setExpoPushToken(null);
      Alert.alert('Notifications Disabled');
    }
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <TouchableOpacity onPress={handleToggle}>
        <Ionicons
          name={enabled ? 'notifications' : 'notifications-off-outline'}
          size={30}
          color={enabled ? '#007bff' : 'gray'}
        />
      </TouchableOpacity>
    </View>
  );
}
