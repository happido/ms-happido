const fs = require('fs');
const path = require('path');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  const filePath = path.join(__dirname, `apps/${app}/src/app/login.tsx`);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Add LottieView, useRef, useEffect imports if not exists
    if (!content.includes('LottieView')) {
      content = content.replace("import { View,", "import LottieView from 'lottie-react-native';\nimport { View,");
    }
    if (!content.includes('useRef')) {
      content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect, useRef } from 'react';");
    }

    // Add interval logic
    const logicHook = `
  const lottieRef = useRef<any>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      lottieRef.current?.play();
    }, 30000);
    return () => clearInterval(interval);
  }, []);
`;
    const componentRegex = /export default function LoginScreen\(\) \{/;
    if (!content.includes('lottieRef')) {
      content = content.replace(componentRegex, (match) => match + logicHook);
    }

    // Replace the old multiline logo container
    const oldLogoBlock = /<View style=\{styles\.logoContainer\}>\s*<LinearGradient[\s\S]*?borderRadius=\{28\}\s*\/>\s*<Ionicons name=".*?" size=\{36\} color="#FFFFFF" \/>\s*<\/View>/;
    
    const newLottieJSX = `<View style={styles.logoContainer}>
              <LottieView 
                ref={lottieRef}
                source={require('../../assets/animations/HAPPIDO_Logo_Vector.json')} 
                autoPlay 
                loop={false}
                style={{ width: 110, height: 110, transform: [{ scale: 1.4 }] }} 
              />
            </View>`;

    if (content.match(oldLogoBlock)) {
      content = content.replace(oldLogoBlock, newLottieJSX);
    }

    // Fix logo container style to match register.tsx premium styling
    const oldLogoStyle = /logoContainer: \{\s*width: 80,\s*height: 80,\s*justifyContent: 'center',\s*alignItems: 'center',\s*marginBottom: 24,[\s\S]*?\},/g;
    const newLogoStyle = `logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 24,
    ...Platform.select({
      web: { boxShadow: '0px 10px 25px rgba(234, 88, 12, 0.4)' },
      default: { shadowColor: '#EA580C', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 }
    })
  },`;

    content = content.replace(oldLogoStyle, newLogoStyle);

    fs.writeFileSync(filePath, content);
    console.log(`Updated Lottie logo on login screen for ${app}`);
  }
});
