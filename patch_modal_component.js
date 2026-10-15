const fs = require('fs');
const path = require('path');

const modalFile = path.join(__dirname, 'apps/restaurant/src/components/NotificationCenterModal.tsx');
let modalContent = fs.readFileSync(modalFile, 'utf8');

// Replace `<Modal visible={visible} animationType="slide" transparent>` with conditional View
const modalStartRegex = /<Modal visible=\{visible\} animationType="slide" transparent>/;
const viewReplacement = `
  if (!visible) return null;
  return (
    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 9999, elevation: 9999 }}>
`;
modalContent = modalContent.replace(modalStartRegex, viewReplacement);

// Replace `</Modal>` with `</View>`
modalContent = modalContent.replace('</Modal>', '</View>');

fs.writeFileSync(modalFile, modalContent);
console.log("Patched NotificationCenterModal to use View instead of Modal");
