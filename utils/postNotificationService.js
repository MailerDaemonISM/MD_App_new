import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendLocalNotification, areNotificationsEnabled } from './notificationService';
import { client } from '../sanity'; // 👈 adjust import path

const LAST_POST_ID_KEY = '@last_notified_post_id';
let isNotifying = false; // 🧠 Lock flag to prevent double notification

/**
 * Check for new *published* posts and notify users
 * Ignores drafts, waits 3 seconds after publish, and prevents duplicates.
 */
export async function checkAndNotifyNewPosts(posts, notificationToggle = true) {
  try {
    // 🚫 Prevent overlapping runs
    if (isNotifying) {
      console.log('Already notifying, skipping duplicate trigger.');
      return false;
    }

    if (!notificationToggle) {
      console.log('Notifications toggle is OFF, skipping check');
      return false;
    }

    const notificationsEnabled = await areNotificationsEnabled();
    if (!notificationsEnabled) {
      console.log('Notifications not enabled in system, skipping check');
      return false;
    }

    if (!posts || posts.length === 0) return false;

    // Filter out drafts
    const latestPost = posts.find(post => !post._id.startsWith('drafts.'));
    if (!latestPost) {
      console.log('No published post found yet');
      return false;
    }

    const lastNotifiedPostId = await AsyncStorage.getItem(LAST_POST_ID_KEY);

    // First-time setup (don't notify)
    if (!lastNotifiedPostId) {
      await AsyncStorage.setItem(LAST_POST_ID_KEY, latestPost._id);
      console.log('Initial setup - saved latest published post ID:', latestPost._id);
      return false;
    }

    // Check if new post
    if (latestPost._id !== lastNotifiedPostId) {
      console.log('Possible new post detected:', latestPost.title);

      // 🧠 Set lock to prevent duplicates
      isNotifying = true;

      // Wait for 3 seconds to ensure full publish
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Re-fetch posts for confirmation
      const updatedPosts = await client.fetch(`*[_type == "post"] | order(_createdAt desc)`);
      const confirmedPost = updatedPosts.find(p => !p._id.startsWith('drafts.'));

      if (!confirmedPost || confirmedPost._id.startsWith('drafts.')) {
        console.log('Post still draft or not stable after delay, skipping notification');
        isNotifying = false;
        return false;
      }

      console.log('✅ Confirmed published post:', confirmedPost.title);

      // Send notification once
      await sendLocalNotification(
        '🔔 New Post from Mailer Daemon!',
        confirmedPost.title,
        {
          postId: confirmedPost._id,
          type: 'new_post',
          title: confirmedPost.title
        }
      );

      await AsyncStorage.setItem(LAST_POST_ID_KEY, confirmedPost._id);

      // 🧹 Unlock after completion
      isNotifying = false;

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking for new posts:', error);
    isNotifying = false; // ensure unlock on failure
    return false;
  }
}

/** Reset for testing */
export async function resetLastNotifiedPost() {
  try {
    await AsyncStorage.removeItem(LAST_POST_ID_KEY);
    console.log('Reset last notified post');
  } catch (error) {
    console.error('Error resetting last notified post:', error);
  }
}

/** Get last notified post ID */
export async function getLastNotifiedPostId() {
  try {
    return await AsyncStorage.getItem(LAST_POST_ID_KEY);
  } catch (error) {
    console.error('Error getting last notified post ID:', error);
    return null;
  }
}

/** Manually set last notified post ID */
export async function setLastNotifiedPostId(postId) {
  try {
    await AsyncStorage.setItem(LAST_POST_ID_KEY, postId);
    console.log('Set last notified post ID:', postId);
  } catch (error) {
    console.error('Error setting last notified post ID:', error);
  }
}
