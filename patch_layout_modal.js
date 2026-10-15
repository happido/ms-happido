const fs = require('fs');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  const layoutPath = `apps/${app}/src/app/_layout.tsx`;

  if (fs.existsSync(layoutPath)) {
    let layoutContent = fs.readFileSync(layoutPath, 'utf8');

    // Make sure LottieView and Modal are imported
    if (!layoutContent.includes('import LottieView')) {
      layoutContent = layoutContent.replace(
        "import { Stack } from 'expo-router';",
        "import { Stack } from 'expo-router';\nimport LottieView from 'lottie-react-native';\nimport { Modal, View } from 'react-native';"
      );
    }

    const modalJSX = `
      {!splashFinished && (
        <Modal visible={true} transparent={false} animationType="fade">
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
            <LottieView
              source={require('../../assets/animations/HAPPIDO_Logo_Vector (2).json')}
              autoPlay
              loop={false}
              style={{ width: 250, height: 250 }}
              onAnimationFinish={() => setSplashFinished(true)}
            />
          </View>
        </Modal>
      )}`;

    // Inject after ThemeProvider
    if (!layoutContent.includes('!splashFinished')) {
      layoutContent = layoutContent.replace(
        /<ThemeProvider[^>]*>/,
        (match) => `${match}\n${modalJSX}`
      );
    }

    fs.writeFileSync(layoutPath, layoutContent);
    console.log(`Injected splash modal for ${app}`);
  }
});
