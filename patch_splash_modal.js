const fs = require('fs');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  const path = `apps/${app}/src/app/index.tsx`;
  if (!fs.existsSync(path)) return;
  
  let content = fs.readFileSync(path, 'utf8');

  // Add Modal import
  if (!content.includes('Modal')) {
    content = content.replace(
      "import { View, Text, StyleSheet,",
      "import { View, Text, StyleSheet, Modal,"
    );
    // If not found in that exact string, try general replace
    if (!content.includes('Modal,')) {
        content = content.replace(
            "import { View, Text, StyleSheet",
            "import { View, Text, StyleSheet, Modal"
        );
    }
  }

  // Find the Loading block
  const loadingBlockRegex = /if\s*\(\s*authStatus\s*===\s*'checking'\s*\|\|\s*!splashFinished\s*\)\s*{\s*return\s*\(\s*<View\s+style={{[^}]*}}>\s*<LottieView[\s\S]*?<\/View>\s*\);\s*}/m;
  
  const match = content.match(loadingBlockRegex);
  if (match) {
    const originalBlock = match[0];
    const newBlock = `if (authStatus === 'checking' || !splashFinished) {
    return (
      <Modal visible={true} transparent={false} animationType="fade">
        <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
          <LottieView
            source={require('../../../animations/HAPPIDO_Logo_Vector (2).json')}
            autoPlay
            loop={false}
            style={{ width: 250, height: 250 }}
            onAnimationFinish={() => setSplashFinished(true)}
          />
        </View>
      </Modal>
    );
  }`;
    
    content = content.replace(originalBlock, newBlock);
    fs.writeFileSync(path, content);
    console.log('Patched modal splash in ' + app);
  } else {
    console.log('Could not find loading block in ' + app);
  }
});
