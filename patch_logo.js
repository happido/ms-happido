const fs = require('fs');
const path = require('path');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  ['login.tsx', 'register.tsx'].forEach(file => {
    const filePath = path.join(__dirname, `apps/${app}/src/app/${file}`);

    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');

      // Add Image import if not exists
      if (!content.includes('Image,')) {
        content = content.replace("import { View, Text, TextInput, StyleSheet", "import { View, Text, TextInput, StyleSheet, Image");
      }

      // 1. Replace the generic icon block in login.tsx
      const oldLoginIconRegex = /<View style=\{styles\.logoContainer\}>\s*<LinearGradient colors=\{\['#F97316', '#EA580C'\]\}.*?\/>\s*<Ionicons name=".*?" size=\{36\} color="#FFFFFF" \/>\s*<\/View>/g;
      
      const newLogoJSX = `<View style={[styles.logoContainer, { backgroundColor: '#FFFFFF', borderRadius: 28, overflow: 'hidden' }]}>
              <Image source={require('../../assets/images/icon.png')} style={{ width: 80, height: 80 }} resizeMode="contain" />
            </View>`;

      content = content.replace(oldLoginIconRegex, newLogoJSX);
      
      // Also in register.tsx, we had a slightly different layout maybe? 
      // Actually my patch script used exactly the same layout for register.tsx
      content = content.replace(/<View style=\{styles\.logoContainer\}>\s*<LinearGradient colors=\{\['#F97316', '#EA580C'\]\} style=\{StyleSheet\.absoluteFill\} borderRadius=\{28\} \/>\s*<Ionicons name=".*?" size=\{36\} color="#FFFFFF" \/>\s*<\/View>/g, newLogoJSX);

      fs.writeFileSync(filePath, content);
      console.log(`Updated logo for ${app} ${file}`);
    }
  });
});
