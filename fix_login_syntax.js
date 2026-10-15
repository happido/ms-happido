const fs = require('fs');
const path = require('path');

const apps = ['customer', 'restaurant', 'rider'];

apps.forEach(app => {
  const filePath = path.join(__dirname, `apps/${app}/src/app/login.tsx`);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    const badSyntax = `  },
      default: {
        shadowColor: '#EA580C',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10,
      }
    }),
  },`;

    if (content.includes(badSyntax)) {
      content = content.replace(badSyntax, '  },');
      fs.writeFileSync(filePath, content);
      console.log(`Fixed syntax error in ${app}/login.tsx`);
    } else {
        // Handle slightly different formatting just in case
        const regex = /\},\s*default: \{\s*shadowColor: '#EA580C',\s*shadowOffset: \{ width: 0, height: 10 \},\s*shadowOpacity: 0\.4,\s*shadowRadius: 15,\s*elevation: 10,?\s*\}\s*\}\),?\s*\}/g;
        if (content.match(regex)) {
             content = content.replace(regex, '}');
             fs.writeFileSync(filePath, content);
             console.log(`Fixed syntax error (regex) in ${app}/login.tsx`);
        }
    }
  }
});
