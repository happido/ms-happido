const fs = require('fs');
const path = require('path');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  const filePath = path.join(__dirname, `apps/${app}/src/app/onboarding.tsx`);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Update JPG to PNG
    content = content.replace(/slide1\.jpg/g, 'slide1.png');
    content = content.replace(/slide2\.jpg/g, 'slide2.png');
    content = content.replace(/slide3\.jpg/g, 'slide3.png');

    // Remove white background and border from image styles
    const oldStyles = `  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 125,
    backgroundColor: '#FFF',
    ...Platform.select({
      web: {
        boxShadow: '0px 15px 30px rgba(0, 0, 0, 0.4)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.4,
        shadowRadius: 30,
        elevation: 15,
      }
    }),
  },
  imageInner: {
    width: 250,
    height: 250,
    borderRadius: 125,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 125,
  },`;

    const newStyles = `  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        // Reduced shadow since it's now applied to a transparent shape
        filter: 'drop-shadow(0px 15px 25px rgba(0, 0, 0, 0.3))',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.3,
        shadowRadius: 25,
        elevation: 15,
      }
    }),
  },
  imageInner: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 280,
    height: 280,
  },`;

    if (content.includes('imageWrapper: {')) {
        content = content.replace(oldStyles, newStyles);
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated to transparent PNGs for ${app}`);
  }
});
