import CameraView from '@/components/CameraView';
import MacroMapView from '@/components/MacroMapView';
import SearchBar from '@/components/SearchBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as Location from 'expo-location';
import { Footprints, Navigation, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';

type AppState = 'default' | 'preview' | 'navigating';

interface Coords {
  lat: number;
  lng: number;
}

export interface Route {
  coords: { latitude: number; longitude: number }[];
  distance: string;
  duration: string;
}

const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.GOOGLE_MAPS_API_KEY ||
  '';

export default function App() {
  const [appState, setAppState] = useState<AppState>('default');
  const [destination, setDestination] = useState('');
  const [destCoords, setDestCoords] = useState<Coords | null>(null);
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);
  const [destAddress, setDestAddress] = useState('');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);

  // All alternative routes returned by the Directions API
  const [allRoutes, setAllRoutes] = useState<Route[]>([]);
  // Index of the route the user has selected (default: 0 = recommended)
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  // Convenience: the currently-selected route's metadata
  const selectedRoute = allRoutes[selectedRouteIndex] ?? null;

  // Decode a Google Maps encoded polyline into lat/lng array
  const decodePolyline = (encoded: string): { latitude: number; longitude: number }[] => {
    const poly: { latitude: number; longitude: number }[] = [];
    let index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      lat += (result & 1) ? ~(result >> 1) : result >> 1;
      shift = 0; result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      lng += (result & 1) ? ~(result >> 1) : result >> 1;
      poly.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return poly;
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setCurrentCoords({ lat: 3.1412, lng: 101.6865 }); // KLCC fallback
          return;
        }
        let location = await Location.getCurrentPositionAsync({});
        setCurrentCoords({ lat: location.coords.latitude, lng: location.coords.longitude });
      } catch (e) {
        setCurrentCoords({ lat: 3.1412, lng: 101.6865 });
      }
    })();
  }, []);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => {
    // Keep array lengths identical to prevent BottomSheet index bugs on Web
    if (appState === 'default') return ['11%', '50%'];
    if (appState === 'preview') return ['21%', '21%'];
    if (appState === 'navigating') return ['21%', '21%'];
    return ['21%', '21%'];
  }, [appState]);

  const handlePlaceSelected = async (placeName: string, lat: number, lng: number, address: string = '') => {
    setDestination(placeName);
    setDestAddress(address);
    setDestCoords({ lat, lng });
    setIsFetchingRoute(true);
    setAllRoutes([]);
    setSelectedRouteIndex(0);
    setAppState('preview');

    try {
      const originLat = currentCoords ? currentCoords.lat : 3.1412;
      const originLng = currentCoords ? currentCoords.lng : 101.6865;

      // Request up to 3 alternative walking routes
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${lat},${lng}&mode=walking&alternatives=true&key=${GOOGLE_MAPS_API_KEY}`;

      let data;
      if (Platform.OS === 'web') {
        // Web needs a CORS proxy
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        data = await response.json();
      } else {
        // Native can call directly — no CORS restriction
        const response = await fetch(url);
        data = await response.json();
      }

      if (data.routes && data.routes.length > 0) {
        const parsed: Route[] = data.routes.map((r: any) => ({
          coords: decodePolyline(r.overview_polyline.points),
          distance: r.legs[0].distance.text,
          duration: r.legs[0].duration.text,
        }));
        setAllRoutes(parsed);
        setSelectedRouteIndex(0);
      } else {
        setAllRoutes([]);
      }
    } catch {
      setAllRoutes([]);
    } finally {
      setIsFetchingRoute(false);
    }
  };

  const startNavigation = () => setAppState('navigating');

  const cancelNavigation = () => {
    setAppState('default');
    setDestination('');
    setDestAddress('');
    setDestCoords(null);
    setAllRoutes([]);
    setSelectedRouteIndex(0);
  };

  return (
    <View className="flex-1 bg-black">
      {/* Background layer: Camera or Map */}
      <View style={{ flex: 1 }}>
        {appState === 'default' || appState === 'navigating' ? (
          <CameraView isNavigating={appState === 'navigating'} destination={destination} />
        ) : (
          <MacroMapView
            currentCoords={currentCoords}
            destCoords={destCoords}
            allRoutes={allRoutes}
            selectedRouteIndex={selectedRouteIndex}
            onRouteSelect={setSelectedRouteIndex}
          />
        )}
      </View>

      {/* Overlay UI - Waze-style Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        keyboardBehavior="extend"
        enablePanDownToClose={false}
        backgroundStyle={{ borderRadius: 24 }}
      >
        <BottomSheetView style={{ flex: 1, paddingHorizontal: 16 }}>
          {/* DEFAULT MODE — Search bar */}
          {appState === 'default' && (
            <SearchBar
              onPlaceSelected={handlePlaceSelected}
              onFocus={() => bottomSheetRef.current?.expand()}
              onBlur={() => bottomSheetRef.current?.collapse()}
            />
          )}

          {/* PREVIEW MODE — Route card */}
          {appState === 'preview' && (
            <View className="flex-1 py-2">
              <Text className="text-xl font-bold mb-1" numberOfLines={1}>
                {destination}
              </Text>
              {destAddress ? (
                <Text className="text-sm text-gray-500 font-medium mb-1" numberOfLines={1}>
                  {destAddress}
                </Text>
              ) : null}

              {isFetchingRoute ? (
                <View className="flex-row items-center gap-2 py-4">
                  <ActivityIndicator color="#208AEF" size="small" />
                  <Text className="text-gray-500">Calculating routes...</Text>
                </View>
              ) : (
                <View className="flex-row items-center gap-2 mt-2 mb-6">
                  <Badge variant="secondary" className="bg-blue-50">
                    <Footprints color="#208AEF" size={14} className="mr-1" />
                    <Text className="text-blue-700 font-semibold text-base">
                      {selectedRoute?.duration ?? 'N/A'}
                    </Text>
                  </Badge>
                  <Text className="text-gray-600 font-medium text-base">
                    •  {selectedRoute?.distance ?? 'N/A'}
                  </Text>
                  {allRoutes.length > 1 && (
                    <Text className="text-gray-400 text-sm">
                      (route {selectedRouteIndex + 1} of {allRoutes.length})
                    </Text>
                  )}
                </View>
              )}

              <View className="flex-row gap-3 mt-auto mb-4">
                <Button
                  variant="outline"
                  size="default"
                  onPress={cancelNavigation}
                  className="w-14 justify-center items-center rounded-full bg-gray-100 border-0"
                >
                  <X color="#666" size={20} />
                </Button>
                <Button
                  variant="default"
                  size="default"
                  onPress={startNavigation}
                  disabled={isFetchingRoute || allRoutes.length === 0}
                  className="flex-1 rounded-full bg-[#208AEF]"
                >
                  <Text className="text-white font-bold text-lg">Go now</Text>
                </Button>
              </View>
            </View>
          )}

          {/* NAVIGATING MODE — Compact nav bar */}
          {appState === 'navigating' && (
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-4">
                <View className="bg-green-100 p-3 rounded-full">
                  <Navigation color="#16a34a" size={24} />
                </View>
                <View>
                  <Text className="text-2xl font-black text-green-600">
                    {selectedRoute?.duration ?? ''}
                  </Text>
                  <Text className="text-gray-500 font-medium">
                    {selectedRoute?.distance ?? ''} • {destination}
                  </Text>
                </View>
              </View>

              <Button
                variant="outline"
                size="sm"
                onPress={cancelNavigation}
                className="w-12 h-12 justify-center items-center rounded-full bg-red-50 border-0"
              >
                <X color="#ef4444" size={20} />
              </Button>
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
