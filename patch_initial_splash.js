const fs = require('fs');

const apps = [
  { path: 'apps/customer/src/app/index.tsx', name: 'CustomerDashboard', bg: '#FFF' },
  { path: 'apps/restaurant/src/app/index.tsx', name: 'RestaurantDashboard', bg: '#FFF7ED' },
  { path: 'apps/rider/src/app/index.tsx', name: 'RiderDashboard', bg: '#F9C935' }
];

apps.forEach(app => {
  let content = fs.readFileSync(app.path, 'utf-8');

  // Add import if not present
  if (!content.includes("import LottieView from 'lottie-react-native';")) {
    content = content.replace("import React, { useState, useEffect", "import LottieView from 'lottie-react-native';\nimport React, { useState, useEffect");
  }

  // Add state
  if (!content.includes("const [splashFinished, setSplashFinished] = useState(false);")) {
    const componentRegex = new RegExp(`export default function ${app.name}\\(\\) \\{`);
    content = content.replace(componentRegex, `export default function ${app.name}() {\n  const [splashFinished, setSplashFinished] = useState(false);`);
  }

  // Replace condition and return block
  const blockRegex = /if \(authStatus === 'checking'\) \{[\s\S]*?return \([\s\S]*?<ActivityIndicator[\s\S]*?<\/View>[\s\S]*?\);[\s\S]*?\}/;
  
  const lottieBlock = `if (authStatus === 'checking' || !splashFinished) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '${app.bg}' }}>
        <LottieView
          autoPlay
          loop={false}
          style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height }}
          source={require('../../assets/animations/HAPPIDO_Logo_Vector.json')}
          onAnimationFinish={() => setSplashFinished(true)}
        />
      </View>
    );
  }`;

  content = content.replace(blockRegex, lottieBlock);

  fs.writeFileSync(app.path, content);
  console.log(`Patched ${app.path}`);
});
