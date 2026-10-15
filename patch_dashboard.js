const fs = require('fs');
const path = require('path');

const dashFile = path.join(__dirname, 'apps/restaurant/src/components/tabs/DashboardTab.tsx');
let dashContent = fs.readFileSync(dashFile, 'utf8');

if (!dashContent.includes('AIPredictionChart')) {
  // Add imports
  const importIndex = dashContent.indexOf("import React");
  const newImports = `
import AIPredictionChart from '../AIPredictionChart';
import AIInsightCard from '../AIInsightCard';
`;
  dashContent = dashContent.substring(0, importIndex) + newImports + dashContent.substring(importIndex);

  // Define Insights inside the component
  const insightsCode = `
  const aiInsights = [
    {
      id: '1',
      type: 'promo',
      title: 'Dynamic Promo Suggestion',
      description: 'Traffic is currently 15% lower than normal. AI suggests creating a 15% off Happy Hour promo to boost sales.',
      actionText: 'Apply Promo',
      impactText: '+ ₹3,200 Est.'
    },
    {
      id: '2',
      type: 'combo',
      title: 'Menu Combo Optimization',
      description: 'Apriori analysis shows 68% of customers order Margherita Pizza with Coke. Create a Combo to increase AOV.',
      actionText: 'Create Combo',
      impactText: '+ 12% AOV'
    },
    {
      id: '3',
      type: 'inventory',
      title: 'Predictive Inventory Alert',
      description: 'Based on current order velocity and historical demand, you are projected to run out of Paneer by 7:30 PM.',
      actionText: 'Order Stock',
      impactText: 'High Risk'
    }
  ];
  `;

  // Find the top of DashboardTab function
  const dashFuncRegex = /export default function DashboardTab\([^)]+\) \{/;
  dashContent = dashContent.replace(dashFuncRegex, match => match + insightsCode);

  // Insert Chart & Insights below "Today's Overview" header
  const overviewRegex = /<Text style=\{styles.sectionTitle\}>Today's Overview<\/Text>/;
  const metricsRegex = /<View style=\{styles.metricsGrid\}>[\s\S]*?<\/View>\s*<\/View>/;
  
  const chartAndInsights = `
        <AIPredictionChart />

        <View style={{ marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Smart Insights</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ overflow: 'visible' }}>
            {aiInsights.map(insight => (
              <AIInsightCard 
                key={insight.id} 
                insight={insight as any} 
                onAction={() => Alert.alert('AI Action Executed', 'The Happido ML engine has applied your selection automatically.')} 
              />
            ))}
          </ScrollView>
        </View>
  `;

  // We will replace the entire metricsGrid with the Chart + Insights + metricsGrid (or just append)
  // Let's replace the section title to inject before the metrics grid
  dashContent = dashContent.replace(overviewRegex, chartAndInsights + '\n<Text style={styles.sectionTitle}>Today\'s Overview</Text>');

  fs.writeFileSync(dashFile, dashContent);
  console.log("Patched DashboardTab with ML features");
}
