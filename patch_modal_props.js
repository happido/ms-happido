const fs = require('fs');
const path = require('path');

// Update NotificationCenterModal.tsx
const modalFile = path.join(__dirname, 'apps/restaurant/src/components/NotificationCenterModal.tsx');
let modalContent = fs.readFileSync(modalFile, 'utf8');

if (!modalContent.includes('newNotification?: PartnerNotification | null;')) {
  modalContent = modalContent.replace('interface Props {', 'interface Props {\n  newNotification?: PartnerNotification | null;');
  modalContent = modalContent.replace('onToggleSound,', 'onToggleSound,\n  newNotification,');
  const effectHook = `
  useEffect(() => {
    if (newNotification) {
      setNotifications(prev => {
        // Prevent duplicates
        if (prev.find(n => n.id === newNotification.id)) return prev;
        return [newNotification, ...prev];
      });
    }
  }, [newNotification]);
  `;
  modalContent = modalContent.replace('const [filter, setFilter]', 'const [filter, setFilter] = useState<\'all\' | \'orders\' | \'payments\' | \'system\'>(\'all\');' + effectHook);
  // Need to import useEffect
  if (!modalContent.includes('import React, { useState, useEffect }')) {
    modalContent = modalContent.replace('import React, { useState }', 'import React, { useState, useEffect }');
  }
  fs.writeFileSync(modalFile, modalContent);
}

// Update index.tsx
const indexFile = path.join(__dirname, 'apps/restaurant/src/app/index.tsx');
let indexContent = fs.readFileSync(indexFile, 'utf8');

if (!indexContent.includes('const [latestNotif, setLatestNotif]')) {
  indexContent = indexContent.replace('const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);', 'const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);\n  const [latestNotif, setLatestNotif] = useState<any>(null);');
  
  // Update socket logic
  const socketRegex = /new Notification\('⚡ New Order Placed!', \{/;
  const replacement = `
          setLatestNotif({
            id: 'n-' + Date.now(),
            type: 'order',
            title: \`New Online Order #\${newOrder._id}\`,
            description: \`New order received. Total: ₹\${newOrder.totalAmount}\`,
            time: 'Just now',
            isRead: false,
            amount: newOrder.totalAmount
          });
          new Notification('⚡ New Order Placed!', {`;
  indexContent = indexContent.replace(socketRegex, replacement);

  // Update modal prop
  const modalRenderRegex = /<NotificationCenterModal([^>]+)>/;
  indexContent = indexContent.replace(modalRenderRegex, '<NotificationCenterModal$1 newNotification={latestNotif} >');
  
  fs.writeFileSync(indexFile, indexContent);
  console.log("Updated Modal to accept and append real-time notifications");
}
