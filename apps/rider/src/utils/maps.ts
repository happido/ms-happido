import { View } from 'react-native';

let MapView: any = View;
let Marker: any = View;
let MapPolyline: any = View;
let Circle: any = View;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const maps = require('react-native-maps');
  MapView = maps.default || maps.MapView || View;
  Marker = maps.Marker || View;
  MapPolyline = maps.Polyline || View;
  Circle = maps.Circle || View;
} catch {
  // Fallback when native module is absent
}

export { MapView, Marker, MapPolyline, Circle };
export default MapView;
