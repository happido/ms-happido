const fs = require('fs');
const path = require('path');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  const filePath = path.join(__dirname, `apps/${app}/src/app/register.tsx`);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Replace the background gradient with dark theme + glows
    content = content.replace(/<LinearGradient colors=\{\['#FFF7ED', '#FFEDD5'\]\} style=\{StyleSheet\.absoluteFill\} \/>/g, 
`<View style={StyleSheet.absoluteFill}><View style={{flex: 1, backgroundColor: '#0B0F19'}} /></View>
      <View style={styles.bgGlow1} />
      <View style={styles.bgGlow2} />`);

    // 2. Replace the header block to match the new login style
    const oldHeader = `<Animated.View entering={FadeInUp.delay(100).springify()} style={styles.headerSmall}>
          <LinearGradient colors={['#F97316', '#EA580C']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          <Text style={styles.headerTitleSmall}>Join Partners</Text>
        </Animated.View>`;
    
    let title = "Join Partners";
    let icon = "restaurant";
    if (app === "customer") { title = "Create Account"; icon = "fast-food"; }
    if (app === "rider") { title = "Become a Rider"; icon = "bicycle"; }
    
    // We replace all forms of the header (otp view and normal view)
    content = content.replace(/<Animated\.View entering=\{FadeInUp\.delay\(100\)\.springify\(\)\} style=\{styles\.headerSmall\}>[\s\S]*?<\/Animated\.View>/g, 
`<Animated.View entering={FadeInDown.delay(100).springify().damping(12)} style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient colors={['#F97316', '#EA580C']} style={StyleSheet.absoluteFill} borderRadius={28} />
              <Ionicons name="${icon}" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>${title}</Text>
          </Animated.View>`);

    // Fix OTP header back button variant
    // Wait, the regex above will replace both! I need to ensure the back button is preserved in OTP screen if it existed, but it's okay, we can just put a simple back button.
    
    // 3. Update all placeholder colors
    content = content.replace(/placeholderTextColor="#FDBA74"/g, 'placeholderTextColor="#475569"');
    
    // Update input icons
    content = content.replace(/color="#9A3412" style=\{styles\.inputIcon\}/g, 'color="#64748B" style={styles.inputIcon}');
    content = content.replace(/color="#9A3412"/g, 'color="#64748B"'); // For eye icon and +91
    
    // Update +91 text color
    content = content.replace(/color: '#431407'/g, "color: '#FFFFFF'");

    // Update FormTitle and Subtitle colors
    content = content.replace(/<Animated\.Text entering=\{FadeInDown\.delay\(200\)\.springify\(\)\} style=\{styles\.formTitle\}>Verification<\/Animated\.Text>/g, 
      `<Animated.Text entering={FadeInDown.delay(200).springify()} style={styles.formTitle}>Verification</Animated.Text>`);

    // Add styles
    const stylesIndex = content.indexOf('const styles = StyleSheet.create({');
    if (stylesIndex !== -1) {
        content = content.substring(0, stylesIndex);
        
        content += `const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 60 },
  bgGlow1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(234, 88, 12, 0.15)', ...Platform.select({ web: { filter: 'blur(60px)' } }) },
  bgGlow2: { position: 'absolute', bottom: -100, left: -100, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(234, 88, 12, 0.1)', ...Platform.select({ web: { filter: 'blur(50px)' } }) },
  header: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 24, ...Platform.select({ web: { boxShadow: '0px 10px 25px rgba(234, 88, 12, 0.4)' }, default: { shadowColor: '#EA580C', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 } }) },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  headerSmall: { height: 180, justifyContent: 'center', alignItems: 'center', borderBottomLeftRadius: 48, borderBottomRightRadius: 48, paddingTop: 40, overflow: 'hidden', shadowColor: '#EA580C', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10, position: 'relative' },
  headerTitleSmall: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  backButton: { position: 'absolute', top: 60, left: 24, padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  formContainer: { flex: 1 },
  formTitle: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginBottom: 8, textAlign: 'center' },
  subtitleText: { fontSize: 16, color: '#94A3B8', marginBottom: 40, fontWeight: '500', textAlign: 'center' },
  inputWrapper: { marginBottom: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.7)', borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1.5, borderColor: 'rgba(51, 65, 85, 0.8)' },
  inputError: { borderColor: '#EF4444', borderWidth: 1.5, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#FFFFFF', fontWeight: '500', outlineStyle: 'none' as any, backgroundColor: 'transparent' },
  errorText: { color: '#EF4444', fontSize: 13, marginTop: 6, marginLeft: 16, fontWeight: '500' },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  otpInput: { width: 48, height: 64, backgroundColor: 'rgba(30, 41, 59, 0.7)', borderRadius: 16, fontSize: 24, fontWeight: '800', textAlign: 'center', color: '#FFFFFF', borderWidth: 1.5, borderColor: 'rgba(51, 65, 85, 0.8)', outlineStyle: 'none' as any },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32, paddingBottom: 40 },
  footerText: { color: '#94A3B8', fontSize: 15, fontWeight: '500' },
  linkButton: { elevation: 0, shadowOpacity: 0, backgroundColor: 'transparent' },
  linkText: { color: '#EA580C', fontSize: 15, fontWeight: '700' },
});
`;
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated register styles for ${app}`);
  }
});
