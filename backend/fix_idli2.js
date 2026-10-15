const fs = require('fs');
const path = 'src/controllers/restaurantController.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace with a guaranteed working image
content = content.replace(
  'https://images.unsplash.com/photo-1610192244261-3f33de715812?w=400&q=80',
  'https://upload.wikimedia.org/wikipedia/commons/1/11/Idli_Sambar.JPG'
);

fs.writeFileSync(path, content);
