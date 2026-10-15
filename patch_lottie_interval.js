const fs = require('fs');
const path = require('path');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  ['login.tsx', 'register.tsx'].forEach(file => {
    const filePath = path.join(__dirname, `apps/${app}/src/app/${file}`);

    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');

      // Add useRef, useEffect to login.tsx
      if (file === 'login.tsx' && !content.includes('useRef')) {
        content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect, useRef } from 'react';");
      }

      // Add lottieRef and interval logic inside the component
      // Find the start of the component
      const componentRegex = /export default function (LoginScreen|RegisterScreen)\(\) \{/;
      
      const logicHook = `
  const lottieRef = useRef<any>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      lottieRef.current?.play();
    }, 120000);
    return () => clearInterval(interval);
  }, []);
`;
      if (!content.includes('lottieRef')) {
        content = content.replace(componentRegex, (match) => match + logicHook);
      }

      // Update LottieView props
      const oldLottieJSX = `<LottieView 
                source={require('../../assets/animations/HAPPIDO_Logo_Vector.json')} 
                autoPlay 
                loop 
                style={{ width: 140, height: 140, transform: [{ scale: 1.5 }] }} 
              />`;
              
      const newLottieJSX = `<LottieView 
                ref={lottieRef}
                source={require('../../assets/animations/HAPPIDO_Logo_Vector.json')} 
                autoPlay 
                loop={false}
                style={{ width: 140, height: 140, transform: [{ scale: 1.5 }] }} 
              />`;

      if (content.includes('loop \n')) {
          // just doing generic replace for loop prop
          content = content.replace(/autoPlay\s+loop\s+style=/g, 'autoPlay loop={false} style=');
          content = content.replace(/<LottieView/g, '<LottieView ref={lottieRef}');
      } else {
          content = content.replace(oldLottieJSX, newLottieJSX);
      }

      fs.writeFileSync(filePath, content);
      console.log(`Updated Lottie loop logic for ${app} ${file}`);
    }
  });
});
