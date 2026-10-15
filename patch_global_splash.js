const fs = require('fs');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  const layoutPath = `apps/${app}/src/app/_layout.tsx`;
  const indexPath = `apps/${app}/src/app/index.tsx`;

  if (fs.existsSync(layoutPath)) {
    let layoutContent = fs.readFileSync(layoutPath, 'utf8');

    // Remove old AnimatedSplashOverlay
    layoutContent = layoutContent.replace(/import \{ AnimatedSplashOverlay \} from '@\/components\/animated-icon';/g, '');
    layoutContent = layoutContent.replace(/<AnimatedSplashOverlay \/>/g, '');

    // Add new imports
    if (!layoutContent.includes('LottieView')) {
      layoutContent = layoutContent.replace(
        "import { View } from 'react-native';",
        "import { View, Modal } from 'react-native';\nimport LottieView from 'lottie-react-native';"
      );
    }
    
    if (!layoutContent.includes('import { useState }')) {
        layoutContent = layoutContent.replace(
            "import { useEffect } from 'react';",
            "import { useEffect, useState } from 'react';"
        );
    } else {
        layoutContent = layoutContent.replace(
            "import { useEffect } from 'react';",
            "import { useEffect, useState } from 'react';" // fallback
        );
    }

    // Add state
    if (!layoutContent.includes('const [splashFinished, setSplashFinished]')) {
      layoutContent = layoutContent.replace(
        "const colorScheme = useColorScheme();",
        "const colorScheme = useColorScheme();\n  const [splashFinished, setSplashFinished] = useState(false);"
      );
    }

    // Add Modal splash
    const modalJSX = `{!splashFinished && (
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

    if (!layoutContent.includes('!splashFinished')) {
      layoutContent = layoutContent.replace(
        "<GlobalProvider>",
        `<GlobalProvider>\n        ${modalJSX}`
      );
    }

    fs.writeFileSync(layoutPath, layoutContent);
    console.log(`Patched layout for ${app}`);
  }

  // Clean up index.tsx (remove modal splash so we don't have duplicate)
  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // We just need to replace the Modal splash with a simple blank View while auth is checking
    const modalRegex = /if\s*\(\s*authStatus\s*===\s*'checking'\s*\|\|\s*!splashFinished\s*\)\s*\{\s*return\s*\([\s\S]*?<\/Modal>\s*\);\s*\}/m;
    const newBlankLoading = `if (authStatus === 'checking') {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }`;
    
    indexContent = indexContent.replace(modalRegex, newBlankLoading);
    fs.writeFileSync(indexPath, indexContent);
    console.log(`Cleaned up index for ${app}`);
  }
});
