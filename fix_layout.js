const fs = require('fs');
const layoutPath = '/Users/apple/MS Happido/apps/customer/src/app/_layout.tsx';
let layoutContent = fs.readFileSync(layoutPath, 'utf8');

layoutContent = layoutContent.replace(
  "import { Stack } from 'expo-router';",
  "import { Stack, usePathname } from 'expo-router';"
);

const renderBlock = `
  const pathname = usePathname();
  const hideHeaderOn = ['/restaurants', '/map', '/cart'];
  const shouldHideHeader = hideHeaderOn.includes(pathname);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GlobalProvider>
        <AnimatedSplashOverlay />
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          {!shouldHideHeader && <GlobalHeader />}
`;

layoutContent = layoutContent.replace(
  `  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GlobalProvider>
        <AnimatedSplashOverlay />
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <GlobalHeader />`,
  renderBlock
);

fs.writeFileSync(layoutPath, layoutContent);
console.log('Layout updated');
