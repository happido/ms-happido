const fs = require('fs');

const path = 'apps/customer/src/app/tracking/[id].tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Polyline to imports
if (!content.includes('Polyline')) {
  content = content.replace(
    "DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';",
    "DirectionsRenderer, Polyline, useJsApiLoader } from '@react-google-maps/api';"
  );
}

// 2. Hide Google Maps logo with injected CSS
const oldMapContainerStyle = `mapContainerStyle={{ width: '100%', height: 'calc(100% + 35px)' }}`;
const newMapContainerStyle = `mapContainerStyle={{ width: '100%', height: '100%', borderRadius: 16 }}`;
content = content.replace(oldMapContainerStyle, newMapContainerStyle);

const injectedCSS = `{Platform.OS === 'web' && (
                <div dangerouslySetInnerHTML={{__html: \`<style>
                  .gmnoprint, .gm-style-cc { display: none !important; }
                  a[href^="https://maps.google.com/maps"] { display: none !important; }
                  a[target="_blank"] { display: none !important; }
                </style>\`}} />
              )}`;
              
if (!content.includes('.gmnoprint, .gm-style-cc')) {
  content = content.replace(
    `<View style={styles.webMapContainer}>`,
    `<View style={styles.webMapContainer}>\n              ${injectedCSS}`
  );
}

// 3. Update DirectionsRenderer and add Polyline for glow effect
const oldDirections = `<DirectionsRenderer 
                      directions={directionsResponse}
                      options={{
                        suppressMarkers: true,
                        polylineOptions: {
                          strokeColor: '#F9C935',
                          strokeWeight: 4,
                        }
                      }}
                    />`;

const newDirections = `<DirectionsRenderer 
                      directions={directionsResponse}
                      options={{
                        suppressMarkers: true,
                        suppressPolylines: true
                      }}
                    />
                    {directionsResponse?.routes?.[0]?.overview_path && (
                      <>
                        {/* Glow Effect (Outer thick transparent line) */}
                        <Polyline
                          path={directionsResponse.routes[0].overview_path}
                          options={{
                            strokeColor: '#F9C935',
                            strokeOpacity: 0.3,
                            strokeWeight: 14,
                            geodesic: true
                          }}
                        />
                        {/* Core Line (Inner solid line) */}
                        <Polyline
                          path={directionsResponse.routes[0].overview_path}
                          options={{
                            strokeColor: '#F9C935',
                            strokeOpacity: 1.0,
                            strokeWeight: 4,
                            geodesic: true
                          }}
                        />
                      </>
                    )}`;

content = content.replace(oldDirections, newDirections);

fs.writeFileSync(path, content);
console.log('Successfully patched ' + path);
