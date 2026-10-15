const fs = require('fs');
const path = require('path');

const files = [
  '/Users/apple/MS Happido/apps/customer/src/app/login.tsx',
  '/Users/apple/MS Happido/apps/customer/src/app/register.tsx',
  '/Users/apple/MS Happido/apps/rider/src/app/login.tsx',
  '/Users/apple/MS Happido/apps/rider/src/app/register.tsx',
  '/Users/apple/MS Happido/apps/restaurant/src/app/register.tsx'
];

files.forEach(f => {
  try {
    let content = fs.readFileSync(f, 'utf-8');
    // Ensure we don't double patch
    if (!content.includes('outline: none !important;')) {
      content = content.replace(
        /transition: background-color 5000s ease-in-out 0s;\s*\}/g, 
        'transition: background-color 5000s ease-in-out 0s;\n          }\n          input:focus {\n              outline: none !important;\n          }'
      );
      fs.writeFileSync(f, content);
      console.log('Patched: ' + f);
    }
  } catch (err) {
    console.error('Error patching ' + f, err);
  }
});
