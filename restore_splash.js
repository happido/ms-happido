const fs = require('fs');

const apps = [
  { path: 'apps/customer/src/components/animated-icon.tsx', icon: 'happy', text: 'Happido', color: '#4F46E5' },
  { path: 'apps/restaurant/src/components/animated-icon.tsx', icon: 'restaurant', text: 'Happido Partners', color: '#EA580C' },
  { path: 'apps/rider/src/components/animated-icon.tsx', icon: 'bicycle', text: 'Happido Rider', color: '#10B981' } // using emerald green for rider
];

apps.forEach(app => {
  let content = fs.readFileSync(app.path, 'utf-8');
  
  // Remove LottieView import
  content = content.replace("import LottieView from 'lottie-react-native';\n", "");
  
  const originalOverlay = `export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: {
      transform: [{ scale: 1 }],
      opacity: 1,
    },
    20: {
      opacity: 1,
    },
    70: {
      opacity: 0,
      easing: Easing.elastic(0.7),
    },
    100: {
      opacity: 0,
      transform: [{ scale: 1 }],
      easing: Easing.elastic(0.7),
    },
  });

  const image = (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="${app.icon}" size={80} color="#FFFFFF" />
      <Text style={{ color: '#FFFFFF', fontSize: 36, fontWeight: '900', marginTop: 16, letterSpacing: 1 }}>${app.text}</Text>
    </View>
  );

  return animate ? (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.splashOverlay}>
      {image}
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={styles.splashOverlay}>
      {image}
    </View>
  );
}`;

  content = content.replace(/export function AnimatedSplashOverlay\(\) \{[\s\S]*?\n\}\n\nconst keyframe/, originalOverlay + '\n\nconst keyframe');

  fs.writeFileSync(app.path, content);
  console.log('Restored', app.path);
});
