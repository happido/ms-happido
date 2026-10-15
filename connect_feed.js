const fs = require('fs');
const file = '/Users/apple/MS Happido/apps/customer/src/app/restaurants.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldImport = "import { MOCK_SWIGGY_FEED } from '../utils/mockSwiggyFeed';";
content = content.replace(oldImport, "import api from '../utils/api';");

const oldComponent = `export default function RestaurantsScreen() {
  const [feed, setFeed] = useState<any[]>(MOCK_SWIGGY_FEED);`;
  
const newComponent = `export default function RestaurantsScreen() {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await api.get('/restaurants/feed');
        if (response.data && response.data.length > 0) {
          setFeed(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch dynamic feed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);`;
  
content = content.replace(oldComponent, newComponent);

content = content.replace("<ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false} bounces={false}>", "{loading ? <ActivityIndicator size=\"large\" color=\"#EA580C\" style={{marginTop: 100}} /> : <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false} bounces={false}>");

content = content.replace("        {/* Bottom spacer */}\n        <View style={{height: 150}} />\n      </ScrollView>", "        {/* Bottom spacer */}\n        <View style={{height: 150}} />\n      </ScrollView>}");

fs.writeFileSync(file, content);
console.log('Frontend connected to backend feed');
