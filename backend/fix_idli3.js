const fs = require('fs');
const path = 'src/controllers/restaurantController.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace with a guaranteed working Unsplash image
content = content.replace(
  'https://upload.wikimedia.org/wikipedia/commons/1/11/Idli_Sambar.JPG',
  'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400&q=80'
);

fs.writeFileSync(path, content);
