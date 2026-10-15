const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, 'apps/customer/src/app/index.tsx');
let indexContent = fs.readFileSync(indexFile, 'utf8');

if (!indexContent.includes('Zomato-Style Algorithmic Notification')) {
  const notifLogic = `
  // Zomato-Style Algorithmic Notification Engine
  useEffect(() => {
    if (authStatus === 'authenticated' && Platform.OS === 'web' && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          // Simulate the algorithmic engine triggering a context-aware push notification based on time of day
          const currentHour = new Date().getHours();
          let title = "Craving something?";
          let body = "Open Happido to find the best spots around you.";
          let iconUrl = "https://happido-assets.s3.amazonaws.com/icons/default.png";

          if (currentHour >= 11 && currentHour <= 15) {
             title = "Hungry, maheer? 🤤";
             body = "It's Lunch time! Make your lunch happy with Happido today. Grab a piping hot Biryani now! 🥘";
             iconUrl = "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop";
          } else if (currentHour >= 19 && currentHour <= 23) {
             title = "Dinner time is here! 🌙";
             body = "Skip the cooking tonight. Order a premium dinner from your favorite local spots on Happido. 🍕";
             iconUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop";
          } else if (currentHour >= 7 && currentHour <= 10) {
             title = "Morning fuel! ☕";
             body = "Start your day right with a crispy Ghee Roast Dosa and Filter Coffee. Delivered in 15 mins!";
             iconUrl = "https://images.unsplash.com/photo-1589301760014-d929f39ce9b0?w=200&h=200&fit=crop";
          }

          // Simulate notification arriving 5 seconds after app opens
          setTimeout(() => {
            new Notification(title, {
              body: body,
              icon: iconUrl,
              requireInteraction: true
            });
          }, 5000);
        }
      });
    }
  }, [authStatus]);
`;

  const setupDataRegex = /const handleLogout = async \(\) => \{/;
  indexContent = indexContent.replace(setupDataRegex, notifLogic + '\n  const handleLogout = async () => {');
  fs.writeFileSync(indexFile, indexContent);
  console.log("Added Algorithmic Push Notifications to Customer App.");
} else {
  console.log("Algorithmic Push Notifications already added.");
}
