const fs = require('fs');
const file = '/Users/apple/MS Happido/apps/rider/src/app/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix Header CSS
content = content.replace(
  "profileBtn: {\n    width: 48,\n    height: 48,\n    borderRadius: 24,\n    backgroundColor: '#334155',\n    justifyContent: 'center',\n    alignItems: 'center',\n  },",
  "profileBtn: {\n    width: 48,\n    height: 48,\n    borderRadius: 24,\n    backgroundColor: '#F1F5F9',\n    justifyContent: 'center',\n    alignItems: 'center',\n    borderWidth: 1,\n    borderColor: '#E2E8F0'\n  },"
);

content = content.replace(
  "sosBtn: {\n    width: 48,\n    height: 48,\n    borderRadius: 24,\n    backgroundColor: '#FFF',\n    justifyContent: 'center',\n    alignItems: 'center',\n    shadowColor: '#000',\n    shadowOffset: { width: 0, height: 2 },\n    shadowOpacity: 0.1,\n    shadowRadius: 4,\n    elevation: 4\n  },",
  "sosBtn: {\n    width: 48,\n    height: 48,\n    borderRadius: 24,\n    backgroundColor: '#FFF',\n    justifyContent: 'center',\n    alignItems: 'center',\n    shadowColor: '#EF4444',\n    shadowOffset: { width: 0, height: 4 },\n    shadowOpacity: 0.2,\n    shadowRadius: 8,\n    elevation: 4\n  },"
);

// Fix Bottom Overlay Padding
content = content.replace(
  "bottomOverlay: {\n    position: 'absolute',\n    bottom: 80,\n    left: 20,\n    right: 20,\n    alignItems: 'center',\n  },",
  "bottomOverlay: {\n    position: 'absolute',\n    bottom: 90,\n    left: 20,\n    right: 20,\n    alignItems: 'center',\n  },"
);

fs.writeFileSync(file, content);
console.log('Styles Patched');
