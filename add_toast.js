const fs = require('fs');
const path = require('path');

const dashFile = path.join(__dirname, 'apps/restaurant/src/components/tabs/DashboardTab.tsx');
let dashContent = fs.readFileSync(dashFile, 'utf8');

if (!dashContent.includes('const [toastMsg, setToastMsg]')) {
  // Add state
  const stateRegex = /export default function DashboardTab\([^)]+\) \{/;
  dashContent = dashContent.replace(stateRegex, match => match + '\n  const [toastMsg, setToastMsg] = useState<string | null>(null);\n');

  // Replace alert
  const alertRegex = /alert\('The Happido ML engine has applied your selection automatically\.'\)/g;
  dashContent = dashContent.replace(alertRegex, "() => { setToastMsg('ML Engine applied selection successfully'); setTimeout(() => setToastMsg(null), 3000); }() ");

  // Add the Toast UI at the bottom of the SafeAreaView
  const safeAreaEndRegex = /<\/SafeAreaView>/;
  const toastUI = `
      {toastMsg && (
        <Animated.View entering={FadeInDown.springify()} style={styles.toastContainer}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.toastText}>{toastMsg}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  `;
  dashContent = dashContent.replace(safeAreaEndRegex, toastUI);

  // Add styles
  const stylesheetRegex = /export const styles = StyleSheet\.create\(\{/;
  const toastStyle = `export const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },`;
  dashContent = dashContent.replace(stylesheetRegex, toastStyle);

  fs.writeFileSync(dashFile, dashContent);
  console.log("Added sleek Toast notification to DashboardTab");
} else {
  console.log("Toast already added");
}
