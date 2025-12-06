import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

// Configure how notifications should be handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions from the user
 * @returns {Promise<boolean>} - Returns true if permission granted, false otherwise
 */
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6600',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings to receive updates from Mailer Daemon.'
      );
      return false;
    }
    
    // Get the Expo push token (useful for sending notifications from a server)
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: '67ca0aa9-492d-41f1-bbdb-6f8c16d7b345', // Your EAS project ID from app.json
    })).data;
    
    console.log('Push Token:', token);
    return true;
  } else {
    Alert.alert(
      'Physical Device Required',
      'Push notifications only work on physical devices, not simulators/emulators.'
    );
    return false;
  }
}

/**
 * Schedule a local notification immediately
 * @param {string} title - Notification title
 * @param {string} body - Notification body/message
 * @param {object} data - Optional data to pass with the notification
 */
export async function sendLocalNotification(title, body, data = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        badge: 1,
        color: '#FF6600', // MD orange color
        categoryIdentifier: 'md_post',
        ios: {
          sound: true,
        },
        android: {
          channelId: 'md_notifications',
          smallIcon: 'ic_notification',
          largeIcon: require('../assets/md.jpg'),
        },
      },
      trigger: null, // null means send immediately
    });
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
    Alert.alert('Error', 'Failed to send notification');
  }
}

/**
 * Schedule a notification for a specific time
 * @param {string} title - Notification title
 * @param {string} body - Notification body/message
 * @param {number} seconds - Number of seconds from now to send the notification
 * @param {object} data - Optional data to pass with the notification
 */
export async function scheduleNotification(title, body, seconds = 5, data = {}) {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        seconds: seconds,
      },
    });
    console.log('Notification scheduled with ID:', id);
    return id;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    Alert.alert('Error', 'Failed to schedule notification');
  }
}

/**
 * Cancel a scheduled notification
 * @param {string} notificationId - The ID of the notification to cancel
 */
export async function cancelNotification(notificationId) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 * @returns {Promise<Array>} - Array of scheduled notifications
 */
export async function getAllScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Check if notifications are enabled
 * @returns {Promise<boolean>} - Returns true if notifications are enabled
 */
export async function areNotificationsEnabled() {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

