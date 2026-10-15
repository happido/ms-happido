const fs = require('fs');
const path = require('path');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  const filePath = path.join(__dirname, `apps/${app}/src/app/register.tsx`);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Insert JSX before footer
    const oldFooter = `<Animated.View entering={FadeInDown.delay(800).springify()} style={styles.footer}>`;
    const newJSX = `          <Animated.View entering={FadeInDown.delay(730).springify().damping(12)} style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(760).springify().damping(12)} style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Coming Soon', 'Google OAuth integration pending')}>
              <Ionicons name="logo-google" size={22} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert('Coming Soon', 'Apple OAuth integration pending')}>
              <Ionicons name="logo-apple" size={22} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800).springify()} style={styles.footer}>`;

    if (content.includes(oldFooter) && !content.includes('logo-google')) {
        content = content.replace(oldFooter, newJSX);
    }

    // 2. Insert Styles before footer styles
    const oldFooterStyle = `  footer: {`;
    const newStyles = `  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(51, 65, 85, 0.6)',
  },
  dividerText: {
    color: '#64748B',
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1.5,
    borderColor: 'rgba(51, 65, 85, 0.6)',
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }
    })
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  footer: {`;

    if (content.includes(oldFooterStyle) && !content.includes('dividerContainer: {')) {
        content = content.replace(oldFooterStyle, newStyles);
    }

    fs.writeFileSync(filePath, content);
    console.log(`Added OAuth UI to ${app} register`);
  }
});
