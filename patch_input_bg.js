const fs = require('fs');
const path = require('path');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  const filePath = path.join(__dirname, `apps/${app}/src/app/login.tsx`);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    const oldStyle = `  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    outlineStyle: 'none' as any,
  },`;

    const newStyle = `  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    outlineStyle: 'none' as any,
    backgroundColor: 'transparent',
  },`;

    if (content.includes('outlineStyle: \'none\' as any,')) {
        content = content.replace(oldStyle, newStyle);
    }
    
    // Also inject some global CSS to kill Chrome autofill background
    if (!content.includes('style={{ display: \'none\' }}')) {
        const styleTag = `
        <style dangerouslySetInnerHTML={{__html: \`
          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus, 
          input:-webkit-autofill:active{
              -webkit-box-shadow: 0 0 0 30px transparent inset !important;
              -webkit-text-fill-color: white !important;
              transition: background-color 5000s ease-in-out 0s;
          }
        \`}} />
`;
        // Insert style tag right after <KeyboardAvoidingView>
        content = content.replace('<KeyboardAvoidingView behavior={Platform.OS === \'ios\' ? \'padding\' : \'height\'} style={styles.root}>', '<KeyboardAvoidingView behavior={Platform.OS === \'ios\' ? \'padding\' : \'height\'} style={styles.root}>' + styleTag);
    }

    fs.writeFileSync(filePath, content);
    console.log(`Fixed transparent inputs for ${app}`);
  }
});
