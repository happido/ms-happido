const fs = require('fs');
const file = '/Users/apple/MS Happido/apps/customer/src/app/map.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add WebSocket Connection Logic
const useEffectHook = `  useEffect(() => {
    let newSocket;
    const setupSocket = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        newSocket = io('http://localhost:5005');
        setSocket(newSocket);

        newSocket.on('connect', () => {
          newSocket.emit('joinRoom', userId);
        });

        newSocket.on('rideStatusUpdate', (rideUpdate) => {
          console.log('Got ride update!', rideUpdate);
          setActiveRide(rideUpdate);
          
          if (rideUpdate.status === 'completed') {
            Alert.alert('Trip Completed! 🎉', \`Your trip has ended safely. Total fare: ₹\${rideUpdate.fare || 0}\`);
            setTimeout(() => {
               setActiveRide(null);
            }, 2000);
          }
        });

        // Driver live location tracking (Bonus)
        newSocket.on('riderLocationUpdate', (data) => {
           setActiveRiderLocation(data.location);
        });
      }
    };
    setupSocket();

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);`;

content = content.replace(
  "const [isFetchingPlaces, setIsFetchingPlaces] = useState(false);",
  "const [isFetchingPlaces, setIsFetchingPlaces] = useState(false);\n\n" + useEffectHook
);

// 2. Build the Active Ride UI
const oldActiveUI = `          /* 3. ASSIGNED / ARRIVED / IN PROGRESS STATE */
          <View style={styles.acceptedContainer}>
            <Text>Driver is on the way...</Text>
          </View>`;

const newActiveUI = `          /* 3. ASSIGNED / ARRIVED / IN PROGRESS STATE */
          <View style={[styles.acceptedContainer, { padding: 20 }]}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
              <View>
                <Text style={{fontSize: 22, fontWeight: '900', color: '#1C1C1C'}}>
                  {activeRide.status === 'accepted' ? 'Driver is on the way' : 
                   activeRide.status === 'arrived' ? 'Driver Arrived!' : 'Ride in Progress'}
                </Text>
                <Text style={{fontSize: 14, color: '#64748B', marginTop: 4}}>
                  {activeRide.vehicleType === 'bike' ? 'Rapido Moto' : activeRide.vehicleType === 'auto' ? 'Rapido Auto' : 'Rapido Car'} • ₹{activeRide.fare}
                </Text>
              </View>
              
              <View style={{backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, alignItems: 'center', borderWidth: 2, borderColor: '#F9C935'}}>
                <Text style={{fontSize: 10, color: '#64748B', fontWeight: 'bold', textTransform: 'uppercase'}}>Start OTP</Text>
                <Text style={{fontSize: 24, fontWeight: '900', color: '#1C1C1C', letterSpacing: 2}}>{activeRide.otp || '----'}</Text>
              </View>
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16}}>
              <View style={{width: 50, height: 50, borderRadius: 25, backgroundColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', marginRight: 16}}>
                <Ionicons name="person" size={24} color="#FFF" />
              </View>
              <View style={{flex: 1}}>
                <Text style={{fontSize: 18, fontWeight: '800', color: '#1E293B'}}>Captain</Text>
                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={{fontSize: 14, fontWeight: '700', color: '#475569', marginLeft: 4}}>4.8</Text>
                  <Text style={{fontSize: 14, color: '#94A3B8', marginLeft: 8}}>• AP04 AB 1234</Text>
                </View>
              </View>
              <TouchableOpacity style={{width: 48, height: 48, borderRadius: 24, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center'}}>
                <Ionicons name="call" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>`;

content = content.replace(oldActiveUI, newActiveUI);

// 3. Mark task completed
let task = fs.readFileSync('/Users/apple/.gemini/antigravity-ide/brain/ccfdad6b-eac2-4aa4-8707-4a3b56a1552b/task.md', 'utf8');
task = task.replace(/- \[ \] Initialize \`socket\.io-client\`/g, '- [x] Initialize `socket.io-client`');
task = task.replace(/- \[ \] Emit \`joinRoom\(userId\)\`/g, '- [x] Emit `joinRoom(userId)`');
task = task.replace(/- \[ \] Add listener for \`rideStatusUpdate\`/g, '- [x] Add listener for `rideStatusUpdate`');
task = task.replace(/- \[ \] Create UI for Active Ride Bottom Sheet/g, '- [x] Create UI for Active Ride Bottom Sheet');
task = task.replace(/- \[ \] Show "Trip Completed"/g, '- [x] Show "Trip Completed"');
fs.writeFileSync('/Users/apple/.gemini/antigravity-ide/brain/ccfdad6b-eac2-4aa4-8707-4a3b56a1552b/task.md', task);

fs.writeFileSync(file, content);
console.log('Patched');
