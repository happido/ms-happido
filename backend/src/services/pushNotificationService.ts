import axios from 'axios';

/**
 * Sends an Expo Push Notification
 * @param expoPushToken The target device's Expo push token
 * @param title Title of the notification
 * @param body Body text of the notification
 * @param data Optional JSON payload for deep linking or app routing
 * @param sound Set to 'default' or a custom sound name if configured in app.json
 */
export const sendPushNotification = async (
  expoPushToken: string,
  title: string,
  body: string,
  data: any = {},
  sound: string = 'default'
) => {
  if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken[')) {
    console.log(`[PushService] Invalid or missing push token: ${expoPushToken}`);
    return;
  }

  const message = {
    to: expoPushToken,
    sound: sound,
    title: title,
    body: body,
    data: data,
    priority: 'high', // Wake lock priority for FCM/APNs
    channelId: 'default', // For Android 8.0+ channels
  };

  try {
    const response = await axios.post('https://exp.host/--/api/v2/push/send', message, {
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
    });
    console.log(`[PushService] Successfully sent notification to ${expoPushToken}`);
    return response.data;
  } catch (error: any) {
    console.error(`[PushService] Error sending push notification:`, error.response?.data || error.message);
  }
};
