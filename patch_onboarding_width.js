const fs = require('fs');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  const filePath = `apps/${app}/src/app/onboarding.tsx`;

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Add containerWidth state
    content = content.replace(
      "const [currentIndex, setCurrentIndex] = useState(0);",
      "const [currentIndex, setCurrentIndex] = useState(0);\n  const [containerWidth, setContainerWidth] = useState(width);"
    );

    // 2. Change width to containerWidth in renderItem
    content = content.replace(
      "return (\n      <View style={styles.slide}>",
      "return (\n      <View style={[styles.slide, { width: containerWidth }]}>"
    );
    
    // Fallback if formatting is slightly different
    content = content.replace(
      "return (\n      <View style={styles.slide}>",
      "return (\n      <View style={[styles.slide, { width: containerWidth }]}>"
    );

    // 3. Change width calculation in onMomentumScrollEnd
    content = content.replace(
      "const index = Math.round(event.nativeEvent.contentOffset.x / width);",
      "const index = Math.round(event.nativeEvent.contentOffset.x / containerWidth);"
    );

    // 4. Add onLayout to root View
    content = content.replace(
      "<View style={styles.container}>",
      "<View style={styles.container} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>"
    );

    // 5. Remove static width from styles
    content = content.replace(
      "slide: {\n    width,\n",
      "slide: {\n"
    );

    fs.writeFileSync(filePath, content);
    console.log(`Patched onboarding layout for ${app}`);
  }
});
