import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendLocalNotification, areNotificationsEnabled } from './notificationService';

const LAST_POST_ID_KEY = '@last_notified_post_id';

/**
 * Check for new posts and notify users
 * @param {Array} posts - Array of posts from Sanity (should be sorted by _createdAt desc)
 * @param {boolean} notificationToggle - Whether notifications are enabled
 * @returns {Promise<boolean>} - Returns true if a new post was found and notification sent
 */
export async function checkAndNotifyNewPosts(posts, notificationToggle = true) {
  try {
    // Check if notifications are enabled by toggle
    if (!notificationToggle) {
      console.log('Notifications toggle is OFF, skipping check');
      return false;
    }

    // Check if notifications are enabled in system
    const notificationsEnabled = await areNotificationsEnabled();
    if (!notificationsEnabled) {
      console.log('Notifications not enabled in system, skipping check');
      return false;
    }

    // If no posts, return
    if (!posts || posts.length === 0) {
      return false;
    }

    // Get the most recent post
    const latestPost = posts[0];

    // Check if post is published (has _id and _createdAt)
    if (!latestPost._id || !latestPost._createdAt) {
      console.log('Post not fully published yet');
      return false;
    }

    // Get the last notified post ID from storage
    const lastNotifiedPostId = await AsyncStorage.getItem(LAST_POST_ID_KEY);

    // If this is the first time or there's a new post
    if (!lastNotifiedPostId) {
      // First time - just save the current latest post ID without notifying
      await AsyncStorage.setItem(LAST_POST_ID_KEY, latestPost._id);
      console.log('First time setup - saved latest post ID:', latestPost._id);
      return false;
    }

    // Check if there's a new post
    if (latestPost._id !== lastNotifiedPostId) {
      console.log('New post detected!', latestPost.title);

      // Send notification
      await sendLocalNotification(
        " 🔔New Post from Mailer Daemon!",
        latestPost.title,
        {
          postId: latestPost._id,
          type: 'new_post',
          title: latestPost.title
        }
      );

      // Update the last notified post ID
      await AsyncStorage.setItem(LAST_POST_ID_KEY, latestPost._id);

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking for new posts:', error);
    return false;
  }
}

/**
 * Reset the last notified post (useful for testing)
 */
export async function resetLastNotifiedPost() {
  try {
    await AsyncStorage.removeItem(LAST_POST_ID_KEY);
    console.log('Reset last notified post');
  } catch (error) {
    console.error('Error resetting last notified post:', error);
  }
}

/**
 * Get the last notified post ID
 * @returns {Promise<string|null>}
 */
export async function getLastNotifiedPostId() {
  try {
    return await AsyncStorage.getItem(LAST_POST_ID_KEY);
  } catch (error) {
    console.error('Error getting last notified post ID:', error);
    return null;
  }
}

/**
 * Manually set the last notified post ID
 * @param {string} postId - The post ID to set
 */
export async function setLastNotifiedPostId(postId) {
  try {
    await AsyncStorage.setItem(LAST_POST_ID_KEY, postId);
    console.log('Set last notified post ID:', postId);
  } catch (error) {
    console.error('Error setting last notified post ID:', error);
  }
}

