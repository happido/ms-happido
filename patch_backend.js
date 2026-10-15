const fs = require('fs');
let file = fs.readFileSync('backend/src/controllers/restaurantController.ts', 'utf8');

const targetStr = `      widgets.push({
        id: \`restaurants_\${tab}\`,
        type: 'restaurant_horizontal_list',
        title: tab === 'ALL' ? 'Fast delivery' : tab === 'STORE' ? 'Premium Stores Near You' : tab === 'OFFERS' ? 'Mega Discounts' : 'Bolt Delivery (Under 10 mins)',
        items: fastDeliveryItems
      });`;

const newStr = `      widgets.push({
        id: \`restaurants_\${tab}\`,
        type: (tab === 'ALL' || tab === 'STORE') ? 'restaurant_vertical_list' : 'restaurant_horizontal_list',
        title: tab === 'ALL' ? 'Fast delivery' : tab === 'STORE' ? 'Premium Stores Near You' : tab === 'OFFERS' ? 'Mega Discounts' : 'Bolt Delivery (Under 10 mins)',
        items: fastDeliveryItems
      });`;

if (file.includes(targetStr)) {
    file = file.replace(targetStr, newStr);
    fs.writeFileSync('backend/src/controllers/restaurantController.ts', file);
    console.log('Patched backend successfully');
} else {
    console.log('Target string not found in backend');
}
