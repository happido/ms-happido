const fs = require('fs');
const file = '/Users/apple/MS Happido/apps/rider/src/app/index.tsx';
let content = fs.readFileSync(file, 'utf8');

const imports = `
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
`;

content = content.replace("import * as ImagePicker from 'expo-image-picker';", "import * as ImagePicker from 'expo-image-picker';" + imports);

const pushFunctions = `
async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
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
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
      console.log("Expo Push Token:", token);
    } catch (e) {
      console.log(e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
`;

content = content.replace("export default function RiderDashboard() {", pushFunctions + "\nexport default function RiderDashboard() {");

const checkAuthLogic = `
        // Push notification logic
        try {
          const pushToken = await registerForPushNotificationsAsync();
          if (pushToken) {
            await api.put('/users/push-token', { token: pushToken });
          }
        } catch (err) {
          console.log("Push token error", err);
        }
`;

content = content.replace("setWalletBalance(res.data.balance || 0);\n        } catch (e) {}", "setWalletBalance(res.data.balance || 0);\n        } catch (e) {}\n" + checkAuthLogic);

fs.writeFileSync(file, content);
console.log("Rider App patched");
