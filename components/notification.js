import React, { useState, useEffect } from "react";
import { TouchableOpacity, Alert } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  registerForPushNotificationsAsync,
  sendLocalNotification,
  areNotificationsEnabled
} from "../utils/notificationService";

const NOTIFICATION_TOGGLE_KEY = '@notification_toggle_enabled';

export default function NotificationButton() {
  const [enabled, setEnabled] = useState(false);
  const [toggleOn, setToggleOn] = useState(true); // Toggle state

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    const isEnabled = await areNotificationsEnabled();
    setEnabled(isEnabled);

    // Get toggle state from storage
    const toggleState = await AsyncStorage.getItem(NOTIFICATION_TOGGLE_KEY);
    if (toggleState !== null) {
      setToggleOn(JSON.parse(toggleState));
    } else {
      setToggleOn(true); // Default to ON
      await AsyncStorage.setItem(NOTIFICATION_TOGGLE_KEY, JSON.stringify(true));
    }
  };

  const handleNotificationPress = async () => {
    if (!enabled) {
      // Request permission first
      const granted = await registerForPushNotificationsAsync();
      if (granted) {
        setEnabled(true);
        setToggleOn(true);
        await AsyncStorage.setItem(NOTIFICATION_TOGGLE_KEY, JSON.stringify(true));

        await sendLocalNotification(
          "🔔 Notifications Enabled!",
          "You'll now receive updates from Mailer Daemon. Stay tuned for campus news and updates!",
          { type: 'welcome' }
        );
        Alert.alert("Success!", "Notifications are now enabled.");
      }
    } else {
      // Toggle notifications on/off
      const newToggleState = !toggleOn;
      setToggleOn(newToggleState);
      await AsyncStorage.setItem(NOTIFICATION_TOGGLE_KEY, JSON.stringify(newToggleState));

      Alert.alert(
        newToggleState ? "Notifications ON" : "Notifications OFF",
        newToggleState
          ? "You'll receive notifications when new posts are published."
          : "You won't receive notifications until you turn them back on."
      );
    }
  };

  return (
    <TouchableOpacity
      onPress={handleNotificationPress}
      style={{ padding: 2, marginLeft: 12 }}
    >
      <Icon
        name={enabled && toggleOn ? "bell" : "bell-o"}
        size={26}
        color={enabled && toggleOn ? "#001affff" : "#333"}
      />
    </TouchableOpacity>
  );
}
