const fs = require('fs');

const apps = ['restaurant', 'rider'];

apps.forEach(app => {
  const indexPath = `apps/${app}/src/app/index.tsx`;

  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');

    const targetRegex = /const checkAuth = async \(\) => \{\s+const token = await AsyncStorage\.getItem\('token'\);\s+if \(!token\) \{\s+setAuthStatus\('unauthenticated'\);\s+\} else \{/m;
    
    const replacement = `const checkAuth = async () => {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        setAuthStatus('onboarding' as any);
        return;
      }
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setAuthStatus('unauthenticated');
      } else {`;
    
    if (content.match(targetRegex)) {
        content = content.replace(targetRegex, replacement);
        
        // Ensure redirect is present
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
        console.log(`Successfully patched routing for ${app}`);
    } else {
        console.log(`Regex did not match for ${app}`);
    }
  }
});
