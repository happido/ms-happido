const fs = require('fs');
const file = '/Users/apple/MS Happido/apps/customer/src/app/restaurants.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\/\/ old[\s\S]*?(?=\/\/ Sections)/;
content = content.replace(regex, `
  // Sections`);

// Put back categoryTitle in the good block
const goodCat = `  categoryCard: { width: 100, height: 120, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#D4AF37', backgroundColor: '#6F002A', alignItems: 'center', paddingTop: 12 },
  categoryImg: { width: 80, height: 80, position: 'absolute', bottom: -10, resizeMode: 'cover', borderRadius: 40 },
  categoryTitle: { color: '#FFF', fontSize: 12, fontWeight: '800', textAlign: 'center', zIndex: 2 },`;

content = content.replace("  categoryImg: { width: '100%', height: '100%' },", goodCat);
content = content.replace("  categoryImg: { width: 80, height: 80, position: 'absolute', bottom: -10, resizeMode: 'cover', borderRadius: 40 },\n  \n", "");

fs.writeFileSync(file, content);
console.log('Fixed');
