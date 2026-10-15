const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, 'apps/restaurant/src/app/index.tsx');
let indexContent = fs.readFileSync(indexFile, 'utf8');

if (!indexContent.includes('Notification.requestPermission')) {
  // Add permission request
  const setupDataRegex = /const setupData = async \(\) => \{/;
  const permissionCode = `const setupData = async () => {
      if (Platform.OS === 'web' && 'Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }`;
  indexContent = indexContent.replace(setupDataRegex, permissionCode);

  // Add system notification for new order
  const alertRegex = /Alert\.alert\('⚡ New Order Placed!', `Order #\$\{newOrder\._id\} arrived\. Total: ₹\$\{newOrder\.totalAmount\}`\);/;
  const notifCode = `if (Platform.OS === 'web' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('⚡ New Order Placed!', {
              body: \`Order #\${newOrder._id} arrived. Total: ₹\${newOrder.totalAmount}\`,
            });
          } else {
            Alert.alert('⚡ New Order Placed!', \`Order #\${newOrder._id} arrived. Total: ₹\${newOrder.totalAmount}\`);
          }`;
  indexContent = indexContent.replace(alertRegex, notifCode);
  fs.writeFileSync(indexFile, indexContent);
  console.log("Updated index.tsx with Notification API");
}
