const fs = require('fs');
const path = require('path');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  const filePath = path.join(__dirname, `apps/${app}/src/app/register.tsx`);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Restore scroll padding
    content = content.replace(/paddingVertical: 20/, 'paddingVertical: 40');
    
    // 2. Restore header margin
    content = content.replace(/marginBottom: 20/, 'marginBottom: 32');
    
    // 3. Restore logo size and fix background framing
    content = content.replace(/width: 64, height: 64/, 'width: 80, height: 80, backgroundColor: "rgba(30, 41, 59, 0.8)", borderRadius: 24');
    content = content.replace(/marginBottom: 12/, 'marginBottom: 20');
    
    // 4. Restore title sizes
    content = content.replace(/headerTitle: \{ fontSize: 26/, 'headerTitle: { fontSize: 30');
    content = content.replace(/formTitle: \{ fontSize: 26/, 'formTitle: { fontSize: 32');
    
    // 5. Restore input margins and heights
    content = content.replace(/inputWrapper: \{ marginBottom: 10 \}/, 'inputWrapper: { marginBottom: 16 }');
    content = content.replace(/height: 48/g, 'height: 56');
    
    // 6. Restore divider margin
    content = content.replace(/marginVertical: 12/, 'marginVertical: 24');
    
    // 7. Restore footer margin
    content = content.replace(/marginTop: 16, paddingBottom: 10/, 'marginTop: 24, paddingBottom: 40');
    
    // 8. Restore LottieView size but keep it fitted to the new rounded background
    content = content.replace(/width: 100, height: 100, transform: \[\{ scale: 1\.5 \}\]/, 'width: 110, height: 110, transform: [{ scale: 1.4 }]');

    fs.writeFileSync(filePath, content);
    console.log(`Restored premium register UI for ${app}`);
  }
});
