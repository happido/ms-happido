const fs = require('fs');
const file = '/Users/apple/MS Happido/apps/customer/src/app/restaurants.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix Category images: The issue is 'position: absolute' mixed with overflow.
// Let's rewrite the category styling to be standard standard vertical stack.
const oldCategoryCat = `          <Text style={styles.categoryTitle}>{item.title}</Text>
          <Image source={{ uri: item.image }} style={styles.categoryImg} />`;

const newCategoryCat = `          <Image source={{ uri: item.image }} style={styles.categoryImg} />
          <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']} style={styles.categoryGradient} />
          <Text style={styles.categoryTitle}>{item.title}</Text>`;
content = content.replace(oldCategoryCat, newCategoryCat);

const newStyles = `
  categoryCard: { width: 100, height: 120, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#D4AF37', backgroundColor: '#6F002A', position: 'relative' },
  categoryImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  categoryGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },
  categoryTitle: { position: 'absolute', bottom: 12, left: 0, right: 0, color: '#FFF', fontSize: 12, fontWeight: '800', textAlign: 'center', zIndex: 2 },
`;

const oldStylesRegex = /categoryCard: \{ width: 100, height: 120, borderRadius: 16[\s\S]*?categoryTitle: \{ color: '#FFF', fontSize: 12, fontWeight: '800', textAlign: 'center', zIndex: 2 \},/;
content = content.replace(oldStylesRegex, newStyles);

fs.writeFileSync(file, content);
console.log('Categories fixed');
