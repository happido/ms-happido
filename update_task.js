const fs = require('fs');
let task = fs.readFileSync('/Users/apple/.gemini/antigravity-ide/brain/ccfdad6b-eac2-4aa4-8707-4a3b56a1552b/task.md', 'utf8');
task = task.replace(/- \[ \] Add permission request/g, '- [x] Add permission request');
task = task.replace(/- \[ \] Transmit the generated push token/g, '- [x] Transmit the generated push token');
fs.writeFileSync('/Users/apple/.gemini/antigravity-ide/brain/ccfdad6b-eac2-4aa4-8707-4a3b56a1552b/task.md', task);
