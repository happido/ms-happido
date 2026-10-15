const fs = require('fs');

const path = 'src/controllers/restaurantController.ts';
let content = fs.readFileSync(path, 'utf8');

// Change header background
content = content.replace("backgroundColor: '#2D003E'", "backgroundColor: '#FFFFFF'");

// Change tall offer backgrounds to oranges
content = content.replace("bgColor: '#7E22CE'", "bgColor: '#EA580C'"); // Orange 600
content = content.replace("bgColor: '#9333EA'", "bgColor: '#F97316'"); // Orange 500
content = content.replace("bgColor: '#6B21A8'", "bgColor: '#FB923C'"); // Orange 400

fs.writeFileSync(path, content);
