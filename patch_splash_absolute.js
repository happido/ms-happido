const fs = require('fs');
const path = require('path');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  const filePath = path.join(__dirname, `apps/${app}/src/app/_layout.tsx`);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    const oldSplash = `      {!splashFinished && (
        <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 99999, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
          <LottieView
            source={require('../../assets/animations/HAPPIDO_Logo_Vector (2).json')}
            autoPlay
            loop={false}
            style={{ width: 250, height: 250 }}
            onAnimationFinish={() => setSplashFinished(true)}
          />
        </View>
      )}`;

    const newSplash = `      {!splashFinished && (
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 99999, elevation: 99999, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
          <LottieView
            source={require('../../assets/animations/HAPPIDO_Logo_Vector (2).json')}
            autoPlay
            loop={false}
            style={{ width: 250, height: 250 }}
            onAnimationFinish={() => setSplashFinished(true)}
          />
        </View>
      )}`;

    if (content.includes('...StyleSheet.absoluteFillObject')) {
        content = content.replace(oldSplash, newSplash);
        fs.writeFileSync(filePath, content);
        console.log(`Fixed absolute fill object for ${app}`);
    }
  }
});
