const fs = require('fs');
const path = require('path');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  const filePath = path.join(__dirname, `apps/${app}/src/app/register.tsx`);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Reduce scroll padding
    content = content.replace(/paddingVertical: 60/, 'paddingVertical: 20');
    
    // 2. Reduce header margin
    content = content.replace(/marginBottom: 40/, 'marginBottom: 20');
    
    // 3. Reduce logo size
    content = content.replace(/width: 80, height: 80/, 'width: 64, height: 64');
    content = content.replace(/marginBottom: 24/, 'marginBottom: 12');
    
    // 4. Reduce title sizes slightly
    content = content.replace(/headerTitle: \{ fontSize: 32/, 'headerTitle: { fontSize: 26');
    content = content.replace(/formTitle: \{ fontSize: 32/, 'formTitle: { fontSize: 26');
    
    // 5. Reduce input margins and heights
    content = content.replace(/inputWrapper: \{ marginBottom: 16 \}/, 'inputWrapper: { marginBottom: 10 }');
    content = content.replace(/height: 56/g, 'height: 48');
    
    // 6. Reduce divider margin
    content = content.replace(/marginVertical: 28/, 'marginVertical: 12');
    
    // 7. Reduce footer margin
    content = content.replace(/marginTop: 32, paddingBottom: 40/, 'marginTop: 16, paddingBottom: 10');
    content = content.replace(/marginTop: 32/, 'marginTop: 16');

    // 8. Reduce LottieView size
    content = content.replace(/width: 140, height: 140, transform: \[\{ scale: 1\.5 \}\]/, 'width: 100, height: 100, transform: [{ scale: 1.5 }]');

    fs.writeFileSync(filePath, content);
    console.log(`Made register UI compact for ${app}`);
  }
});
