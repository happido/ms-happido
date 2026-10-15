const fs = require('fs');

const files = [
  'apps/customer/src/components/animated-icon.tsx',
  'apps/restaurant/src/components/animated-icon.tsx',
  'apps/rider/src/components/animated-icon.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  
  if (!content.includes("import LottieView")) {
    content = content.replace("import { scheduleOnRN } from 'react-native-worklets';", "import { scheduleOnRN } from 'react-native-worklets';\nimport LottieView from 'lottie-react-native';");
  }

  const newOverlay = `export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <View
      onLayout={() => {
        SplashScreen.hideAsync();
      }}
      style={styles.splashOverlay}>
      <LottieView
        autoPlay
        loop={false}
        style={{
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
        }}
        source={require('@/assets/animations/HAPPIDO_Logo_Vector.json')}
        onAnimationFinish={() => {
          setVisible(false);
        }}
      />
    </View>
  );
}`;

  content = content.replace(/export function AnimatedSplashOverlay\(\) \{[\s\S]*?\n\}\n\nconst keyframe/, newOverlay + '\n\nconst keyframe');

  fs.writeFileSync(file, content);
  console.log('Patched', file);
});
