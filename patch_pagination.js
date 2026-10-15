const fs = require('fs');
const path = require('path');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  const filePath = path.join(__dirname, `apps/${app}/src/app/onboarding.tsx`);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    const oldHandleNext = `  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/login');
    }
  };`;

    const newHandleNext = `  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/login');
    }
  };`;

    if (content.includes('flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });\n    } else {')) {
        content = content.replace(oldHandleNext, newHandleNext);
    }
    
    // Also add onScroll just in case for better web support
    const oldScroll = `        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / containerWidth);
          setCurrentIndex(index);
        }}`;
        
    const newScroll = `        onScroll={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / containerWidth);
          if (index !== currentIndex && index >= 0 && index < slides.length) {
            setCurrentIndex(index);
          }
        }}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / containerWidth);
          if (index >= 0 && index < slides.length) setCurrentIndex(index);
        }}`;

    if (content.includes(oldScroll)) {
        content = content.replace(oldScroll, newScroll);
    }

    fs.writeFileSync(filePath, content);
    console.log(`Fixed pagination logic for ${app}`);
  }
});
