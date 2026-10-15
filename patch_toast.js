const fs = require('fs');
const path = require('path');

const dashFile = path.join(__dirname, 'apps/restaurant/src/components/tabs/DashboardTab.tsx');
let dashContent = fs.readFileSync(dashFile, 'utf8');

if (!dashContent.includes('const [toastMsg, setToastMsg]')) {
  // 1. Add state for toast
  const stateRegex = /const activeOrdersCount = orders.filter\(\(o\) => o.status === 'preparing' \|\| o.status === 'ready'\).length;/;
  const toastState = `const activeOrdersCount = orders.filter((o) => o.status === 'preparing' || o.status === 'ready').length;
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };
`;
  // Let me just replace the alert directly and use a simple local state.
}
