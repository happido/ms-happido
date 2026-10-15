const fs = require('fs');

const path = 'apps/customer/src/app/tracking/[id].tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Imports
if (!content.includes('import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";')) {
  content = content.replace(
    "import { LinearGradient } from 'expo-linear-gradient';",
    "import { LinearGradient } from 'expo-linear-gradient';\nimport { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';"
  );
}

// 2. Add useJsApiLoader to component
if (!content.includes('const { isLoaded }')) {
  content = content.replace(
    "const socketRef = useRef<Socket | null>(null);",
    `const socketRef = useRef<Socket | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });
  
  const [directionsResponse, setDirectionsResponse] = useState<any>(null);`
  );
}

// 3. Update the mock order to include coordinates
if (!content.includes('deliveryLocation: { type: \'Point\'')) {
  content = content.replace(
    "deliveryRider: { name: 'Raju Kumar', phone: '+919876543210' }",
    `deliveryRider: { name: 'Raju Kumar', phone: '+919876543210' },
        deliveryLocation: { type: 'Point', coordinates: [78.4800, 17.4500] } // Mock Destination`
  );
}

// 4. Update the useEffect to calculate directions when riderLocation and order are available
if (!content.includes('const calculateRoute = () => {')) {
  content = content.replace(
    "// ─── LOADING STATE ────────────────────────────────────────",
    `
  // ─── ML Routing / ETA ─────────────────────────────────────
  useEffect(() => {
    if (isLoaded && order?.deliveryLocation?.coordinates && riderLocation) {
      const calculateRoute = async () => {
        try {
          // eslint-disable-next-line no-undef
          const directionsService = new google.maps.DirectionsService();
          const results = await directionsService.route({
            origin: { lat: riderLocation.latitude, lng: riderLocation.longitude },
            destination: { lat: order.deliveryLocation.coordinates[1], lng: order.deliveryLocation.coordinates[0] },
            // eslint-disable-next-line no-undef
            travelMode: google.maps.TravelMode.TWO_WHEELER || google.maps.TravelMode.DRIVING,
          });
          setDirectionsResponse(results);
          
          if (results.routes[0]?.legs[0]?.duration?.text) {
             const durationText = results.routes[0].legs[0].duration.text;
             const mins = parseInt(durationText.replace(/[^0-9]/g, ''));
             if (!isNaN(mins)) setEstimatedTime(mins);
          }
        } catch(err) {
          console.log('Directions error', err);
        }
      };
      calculateRoute();
    }
  }, [isLoaded, riderLocation, order]);

  // ─── LOADING STATE ────────────────────────────────────────`
  );
}

// 5. Replace the iframe with GoogleMap
const oldMap = `{Platform.OS === 'web' ? (
            // Web: Embedded OpenStreetMap with rider simulation
            <View style={styles.webMapContainer}>
              <iframe
                src={\`https://www.openstreetmap.org/export/embed.html?bbox=78.40,17.40,78.55,17.50&layer=mapnik&marker=\${riderLocation ? riderLocation.latitude : 17.4400},\${riderLocation ? riderLocation.longitude : 78.4700}\`}
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: 16 } as any}
                title="Live Tracking Map"
              />
              {/* Map Overlay with rider info */}
              <View style={styles.mapOverlay}>
                <View style={styles.mapOverlayInner}>
                  <MaterialCommunityIcons name="motorbike" size={20} color="#EA580C" />
                  <Text style={styles.mapOverlayText}>
                    {isPickedUp ? 'Rider is on the way!' : 'Waiting for pickup...'}
                  </Text>
                </View>
              </View>
            </View>
          ) : (`;

const newMap = `{Platform.OS === 'web' ? (
            <View style={styles.webMapContainer}>
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%', borderRadius: 16 }}
                  center={riderLocation ? { lat: riderLocation.latitude, lng: riderLocation.longitude } : { lat: 17.4400, lng: 78.4700 }}
                  zoom={14}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                  }}
                >
                  {directionsResponse && (
                    <DirectionsRenderer 
                      directions={directionsResponse}
                      options={{
                        suppressMarkers: true,
                        polylineOptions: {
                          strokeColor: '#EA580C',
                          strokeWeight: 4,
                        }
                      }}
                    />
                  )}
                  {riderLocation && (
                    <Marker
                      position={{ lat: riderLocation.latitude, lng: riderLocation.longitude }}
                      icon={{
                        url: 'https://cdn-icons-png.flaticon.com/512/1048/1048314.png',
                        scaledSize: new window.google.maps.Size(40, 40),
                      }}
                    />
                  )}
                  {order?.deliveryLocation?.coordinates && (
                    <Marker
                      position={{ lat: order.deliveryLocation.coordinates[1], lng: order.deliveryLocation.coordinates[0] }}
                      icon={{
                        url: 'https://cdn-icons-png.flaticon.com/512/149/149059.png',
                        scaledSize: new window.google.maps.Size(32, 32),
                      }}
                    />
                  )}
                </GoogleMap>
              ) : (
                <View style={[styles.nativeMapPlaceholder]}><ActivityIndicator color="#EA580C" /></View>
              )}
              {/* Map Overlay with rider info */}
              <View style={styles.mapOverlay}>
                <View style={styles.mapOverlayInner}>
                  <MaterialCommunityIcons name="motorbike" size={20} color="#EA580C" />
                  <Text style={styles.mapOverlayText}>
                    {isPickedUp ? 'Rider is on the way!' : 'Waiting for pickup...'}
                  </Text>
                </View>
              </View>
            </View>
          ) : (`;

content = content.replace(oldMap, newMap);

fs.writeFileSync(path, content);
console.log('Successfully patched ' + path);
