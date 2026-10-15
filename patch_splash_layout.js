const fs = require('fs');
const path = require('path');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  const filePath = path.join(__dirname, `apps/${app}/src/app/_layout.tsx`);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    const oldSplash = `      {!splashFinished && (
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

    const newSplash = `      {!splashFinished && (
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

    if (content.includes('Modal visible={true} transparent={false} animationType="fade"')) {
        content = content.replace(oldSplash, newSplash);
        
        // Also ensure StyleSheet is imported
        if (!content.includes('StyleSheet')) {
            content = content.replace("import { Modal, View } from 'react-native';", "import { Modal, View, StyleSheet } from 'react-native';");
        }
        
        fs.writeFileSync(filePath, content);
        console.log(`Fixed splash layout for ${app}`);
    }
  }
});
