const fs = require('fs');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  const filePath = `apps/${app}/src/app/onboarding.tsx`;

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Fix the Reanimated warning and Shadow box
    const oldAnimatedComponent = `  return (
    <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.imageWrapper, animatedStyle]}>
      <View style={styles.imageInner}>
         <Image source={item.image} style={styles.image} resizeMode="cover" />
      </View>
    </Animated.View>
  );`;

    const newAnimatedComponent = `  return (
    <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.imageWrapperOuter}>
      <Animated.View style={[styles.imageWrapper, animatedStyle]}>
        <View style={styles.imageInner}>
          <Image source={item.image} style={styles.image} resizeMode="cover" />
        </View>
      </Animated.View>
    </Animated.View>
  );`;

    if (content.includes('entering={FadeInDown.delay(200).springify()} style={[styles.imageWrapper, animatedStyle]}')) {
        content = content.replace(oldAnimatedComponent, newAnimatedComponent);
    }

    // 2. Fix the styles for circular crop and proper shadow
    const oldStyles = `  imageWrapper: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  imageInner: {
    width: 250,
    height: 250,
    borderRadius: 125,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  image: {
    width: '100%',
    height: '100%',
  },`;

    const newStyles = `  imageWrapperOuter: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
    borderRadius: 125,
    backgroundColor: '#FFF',
  },
  imageInner: {
    width: 250,
    height: 250,
    borderRadius: 125,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 242,
    height: 242,
    borderRadius: 121,
  },`;

    if (content.includes('imageWrapper: {')) {
        content = content.replace(oldStyles, newStyles);
    }

    fs.writeFileSync(filePath, content);
    console.log(`Fixed styling for ${app}`);
  }
});
