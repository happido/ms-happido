const fs = require('fs');
const path = require('path');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  ['login.tsx', 'register.tsx'].forEach(file => {
    const filePath = path.join(__dirname, `apps/${app}/src/app/${file}`);

    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');

      // Replace 120000 with 30000
      if (content.includes('120000')) {
        content = content.replace('120000', '30000');
        fs.writeFileSync(filePath, content);
        console.log(`Updated Lottie interval to 30 seconds for ${app} ${file}`);
      }
    }
  });
});
