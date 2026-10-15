const fs = require('fs');
const path = 'src/controllers/restaurantController.ts';
let content = fs.readFileSync(path, 'utf8');

// The broken Idli image is: https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=400&q=80
// Replace with a guaranteed working image (another Dosa/Idli looking image)
content = content.replace(
  'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=400&q=80',
  'https://images.unsplash.com/photo-1610192244261-3f33de715812?w=400&q=80' // Working Indian breakfast image
);

fs.writeFileSync(path, content);
