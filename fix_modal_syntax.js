const fs = require('fs');
const path = require('path');

const modals = [
  'apps/restaurant/src/components/NotificationCenterModal.tsx',
  'apps/restaurant/src/components/KOTReceiptModal.tsx',
  'apps/restaurant/src/components/CustomerReviewsModal.tsx',
  'apps/restaurant/src/components/DailyEODReportModal.tsx'
];

modals.forEach(modal => {
  const modalFile = path.join(__dirname, modal);
  if (fs.existsSync(modalFile)) {
    let content = fs.readFileSync(modalFile, 'utf8');
    
    // The bad block:
    //   return (
    //     
    //   if (!visible) return null;
    //   return (
    
    // We want to replace it with:
    //   if (!visible) return null;
    //   return (
    
    content = content.replace(/return\s*\(\s*if\s*\(\!visible\)\s*return\s*null;\s*return\s*\(/g, 'if (!visible) return null;\n  return (');
    
    fs.writeFileSync(modalFile, content);
  }
});
console.log("Fixed syntax error in all Modals");
