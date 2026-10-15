const fs = require('fs');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  const indexPath = `apps/${app}/src/app/index.tsx`;

  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');

    // 1. Update type definition
    content = content.replace(
      /useState\<'checking' \| 'authenticated' \| 'unauthenticated'\>/g,
      "useState<'checking' | 'authenticated' | 'unauthenticated' | 'onboarding'>"
    );

    // 2. Update logic
    const oldAuthCheck = `if (!token) {
          setAuthStatus('unauthenticated');
        } else {
          setAuthStatus('authenticated');
        }`;
    const newAuthCheck = `const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
          setAuthStatus('onboarding');
        } else if (!token) {
          setAuthStatus('unauthenticated');
        } else {
          setAuthStatus('authenticated');
        }`;
    
    if (content.includes(oldAuthCheck)) {
       content = content.replace(oldAuthCheck, newAuthCheck);
    } else if (!content.includes('hasSeenOnboarding')) {
       // Manual fallback for apps with different spacing
       content = content.replace(
         /if\s*\(!token\)\s*\{\s*setAuthStatus\('unauthenticated'\);\s*\}\s*else\s*\{\s*setAuthStatus\('authenticated'\);\s*\}/,
         newAuthCheck
       );
    }

    // 3. Add redirect
    const redirectJSX = `  if (authStatus === 'onboarding') {
    return <Redirect href="/onboarding" />;
  }

  if (authStatus === 'unauthenticated') {`;

    if (!content.includes("href=\"/onboarding\"")) {
       content = content.replace(
         "if (authStatus === 'unauthenticated') {",
         redirectJSX
       );
    }

    fs.writeFileSync(indexPath, content);
    console.log(`Updated routing for ${app}`);
  }
});
