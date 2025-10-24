const { Expo } = require('expo-server-sdk');
const client = require('../api/client'); // your existing Sanity client

const expo = new Expo();

async function sendPushToTokens(tokens = [], message = { title: 'Test', body: 'Hello', data: {} }) {
  if (!tokens.length) return { sent: 0 };
  const messages = tokens.map(token => ({
    to: token,
    sound: 'default',
    title: message.title,
    body: message.body,
    data: message.data || {},
  }));

  const receipts = [];
  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      const resp = await expo.sendPushNotificationsAsync(chunk);
      console.log('Expo send response chunk:', resp);
      receipts.push(...resp);
    } catch (err) {
      console.error('Error sending chunk:', err);
      receipts.push({ error: err.message || err });
    }
  }
  return { sent: messages.length, receipts };
}

async function sendNotifications(post) {
  try {
    // fetch all users who enabled notifications and have a token
    const users = await client.fetch(`
      *[_type == "user" && notificationsEnabled == true && defined(expoPushToken)]{
        _id, expoPushToken
      }
    `);

    const tokens = users.map(u => u.expoPushToken).filter(Boolean);
    console.log('Sending notifications to tokens count:', tokens.length);

    const message = {
      title: 'New post added',
      body: post.title || 'A new post was published',
      data: { postId: post._id || post._id },
    };

    return await sendPushToTokens(tokens, message);
  } catch (err) {
    console.error('sendNotifications error:', err);
    throw err;
  }
}

module.exports = { sendPushToTokens, sendNotifications };