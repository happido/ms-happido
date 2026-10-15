const fs = require('fs');
const path = require('path');

const modals = [
  'apps/restaurant/src/components/KOTReceiptModal.tsx',
  'apps/restaurant/src/components/CustomerReviewsModal.tsx',
  'apps/restaurant/src/components/DailyEODReportModal.tsx'
];

modals.forEach(modal => {
  const modalFile = path.join(__dirname, modal);
  let content = fs.readFileSync(modalFile, 'utf8');
  
  const modalStartRegex = /<Modal visible=\{visible\} animationType="[^"]+" transparent>/;
  const viewReplacement = `
  if (!visible) return null;
  return (
    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 9999, elevation: 9999 }}>
`;
  content = content.replace(modalStartRegex, viewReplacement);
  content = content.replace('</Modal>', '</View>');
  fs.writeFileSync(modalFile, content);
});
console.log("Patched all Modals to use View instead of Modal");
