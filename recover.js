const fs = require('fs');
const lines = fs.readFileSync('/Users/apple/.gemini/antigravity-ide/brain/ccfdad6b-eac2-4aa4-8707-4a3b56a1552b/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
    if (!lines[i]) continue;
    try {
        const data = JSON.parse(lines[i]);
        if (data.type === 'PLANNER_RESPONSE' && data.tool_calls) {
            for (const call of data.tool_calls) {
                if (call.name === 'view_file' && call.args && call.args.AbsolutePath && call.args.AbsolutePath.includes('restaurantController.ts')) {
                   // Let's print out the step index when we viewed the file
                   console.log('Viewed at step:', data.step_index);
                }
            }
        }
        if (data.type === 'TOOL_RESPONSE' && data.content && data.content.includes('export const getRestaurants =')) {
            console.log('Found getRestaurants at step:', data.step_index);
            const matches = data.content.match(/([0-9]+):\s(.*)/g);
            if (matches) {
                fs.writeFileSync('recovered.ts', matches.map(m => m.replace(/^[0-9]+:\s/, '')).join('\n'));
                console.log('Recovered file to recovered.ts');
                process.exit(0);
            }
        }
    } catch(e) {}
}
