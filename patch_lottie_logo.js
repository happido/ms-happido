const fs = require('fs');
const path = require('path');

const apps = ['customer', 'restaurant', 'rider'];
const sourceAnimationPath = '/Users/apple/MS Happido/animations/HAPPIDO_Logo_Vector.json';

apps.forEach(app => {
  // 1. Copy the animation to the app's assets folder
  const destDir = path.join(__dirname, `apps/${app}/assets/animations`);
  if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
  }
  const destPath = path.join(destDir, 'HAPPIDO_Logo_Vector.json');
  fs.copyFileSync(sourceAnimationPath, destPath);

  ['login.tsx', 'register.tsx'].forEach(file => {
    const filePath = path.join(__dirname, `apps/${app}/src/app/${file}`);

    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');

      // Add LottieView import if not exists
      if (!content.includes('LottieView')) {
        content = content.replace("import { View,", "import LottieView from 'lottie-react-native';\nimport { View,");
      }

      // Replace Image with LottieView
      const imageRegex = /<Image source=\{require\('\.\.\/\.\.\/assets\/images\/icon\.png'\)\} style=\{\{ width: 80, height: 80 \}\} resizeMode="contain" \/>/g;
      
      const newLottieJSX = `<LottieView 
                source={require('../../assets/animations/HAPPIDO_Logo_Vector.json')} 
                autoPlay 
                loop 
                style={{ width: 140, height: 140, transform: [{ scale: 1.5 }] }} 
              />`;

      if (content.match(imageRegex)) {
        content = content.replace(imageRegex, newLottieJSX);
      }

      // Adjust logoContainer to fit the Lottie animation perfectly without white background
      // Remove backgroundColor and overflow from logoContainer
      content = content.replace(
          /<View style=\{\[styles\.logoContainer, \{ backgroundColor: '#FFFFFF', borderRadius: 28, overflow: 'hidden' \}\]\}>/g,
          `<View style={styles.logoContainer}>`
      );

      fs.writeFileSync(filePath, content);
      console.log(`Updated to Lottie logo for ${app} ${file}`);
    }
  });
});
