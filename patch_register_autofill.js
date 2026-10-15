const fs = require('fs');
const path = require('path');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  const filePath = path.join(__dirname, `apps/${app}/src/app/register.tsx`);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Inject global CSS to kill Chrome autofill background
    if (!content.includes('style={{ display: \'none\' }}') && !content.includes('-webkit-box-shadow')) {
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
        content = content.replace('<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === \'ios\' ? \'padding\' : undefined}>', '<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === \'ios\' ? \'padding\' : undefined}>' + styleTag);
    }

    fs.writeFileSync(filePath, content);
    console.log(`Added autofill fix to register for ${app}`);
  }
});
