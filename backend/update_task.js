const fs = require('fs');
let task = fs.readFileSync('/Users/apple/.gemini/antigravity-ide/brain/ccfdad6b-eac2-4aa4-8707-4a3b56a1552b/task.md', 'utf8');
task = task.replace(/- \[ \] Install \`expo-server-sdk\`/g, '- [x] Install `expo-server-sdk`');
task = task.replace(/- \[ \] Add \`expoPushToken\`/g, '- [x] Add `expoPushToken`');
task = task.replace(/- \[ \] Add route \`PUT \/api\/users\/push-token\`/g, '- [x] Add route `PUT /api/users/push-token`');
task = task.replace(/- \[ \] Update \`backend\/src\/controllers\/rideController.ts\`/g, '- [x] Update `backend/src/controllers/rideController.ts`');
task = task.replace(/- \[ \] Install \`expo-notifications\`/g, '- [x] Install `expo-notifications`');
fs.writeFileSync('/Users/apple/.gemini/antigravity-ide/brain/ccfdad6b-eac2-4aa4-8707-4a3b56a1552b/task.md', task);
console.log('Task updated');
