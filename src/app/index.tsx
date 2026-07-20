import React, { useState } from 'react';
import { View, SafeAreaView, ActivityIndicator } from 'react-native';
import { Navigation, X, Footprints, AlertTriangle } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import CameraView from '@/components/CameraView';
import MacroMapView from '@/components/MacroMapView';
import SearchBar from '@/components/SearchBar';

type AppState = 'default' | 'preview' | 'navigating';

interface Coords {
  lat: number;
  lng: number;
}

const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.GOOGLE_MAPS_API_KEY ||
  '';

export default function App() {
  const [appState, setAppState] = useState<AppState>('default');
  const [destination, setDestination] = useState('');
  const [destCoords, setDestCoords] = useState<Coords | null>(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);

  const handlePlaceSelected = async (placeName: string, lat: number, lng: number) => {
    setDestination(placeName);
    setDestCoords({ lat, lng });
    setIsFetchingRoute(true);
    setAppState('preview');

    try {
      // NOTE: origin uses the destination's coords as a placeholder
      // until we integrate real-time GPS from MacroMapView
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${lat},${lng}&destination=${lat},${lng}&mode=walking&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const leg = data.routes[0].legs[0];
        setDistance(leg.distance.text);
        setDuration(leg.duration.text);
      } else {
        setDistance('N/A');
        setDuration('N/A');
      }
    } catch {
      setDistance('N/A');
      setDuration('N/A');
    } finally {
      setIsFetchingRoute(false);
    }
  };

  const startNavigation = () => setAppState('navigating');

  const cancelNavigation = () => {
    setAppState('default');
    setDestination('');
    setDestCoords(null);
    setDistance('');
    setDuration('');
  };

  return (
    <View className="flex-1 bg-black">
      {/* Background layer: Camera or Map */}
      {appState === 'default' ? (
        <CameraView />
      ) : (
        <MacroMapView destCoords={destCoords} />
      )}

      {/* Overlay UI */}
      <SafeAreaView className="absolute inset-0" pointerEvents="box-none">
        <View className="flex-1 px-4 pt-4" pointerEvents="box-none">

          {/* DEFAULT MODE — Search bar */}
          {appState === 'default' && (
            <SearchBar onPlaceSelected={handlePlaceSelected} />
          )}

          {/* PREVIEW MODE — Route card */}
          {appState === 'preview' && (
            <Card className="bg-white/95">
              <CardHeader className="pb-2">
                <CardTitle className="text-base" numberOfLines={2}>
                  {destination}
                </CardTitle>
              </CardHeader>

              <CardContent>
                {isFetchingRoute ? (
                  <View className="flex-row items-center gap-2 py-1">
                    <ActivityIndicator color="#208AEF" size="small" />
                    <Text variant="muted">Calculating route...</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-2 flex-wrap">
                    <Badge variant="secondary">
                      <Footprints color="#208AEF" size={12} />
                      <Text>{duration}</Text>
                    </Badge>
                    <Badge variant="outline">
                      <Text>{distance}</Text>
                    </Badge>
                  </View>
                )}
              </CardContent>

              <CardFooter className="gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onPress={cancelNavigation}
                  accessibilityLabel="Cancel destination"
                  className="flex-row gap-1.5"
                >
                  <X color="#fff" size={16} />
                  <Text>Cancel</Text>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onPress={startNavigation}
                  disabled={isFetchingRoute}
                  accessibilityLabel="Start navigation"
                  className="flex-1 flex-row gap-1.5"
                >
                  <Navigation color="#fff" size={16} />
                  <Text>Start Navigation</Text>
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* NAVIGATING MODE — Compact nav bar */}
          {appState === 'navigating' && (
            <Card className="bg-white/95">
              <CardContent className="flex-row items-center gap-3 py-3">
                <View className="flex-1">
                  <Text variant="large" numberOfLines={1}>{destination}</Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <Badge variant="secondary" className="flex-row gap-1">
                      <Footprints color="#208AEF" size={12} />
                      <Text>{duration}  ·  {distance}</Text>
                    </Badge>
                  </View>
                </View>
                <Button
                  variant="destructive"
                  size="sm"
                  onPress={cancelNavigation}
                  accessibilityLabel="End route"
                  className="flex-row gap-1.5"
                >
                  <X color="#fff" size={16} />
                  <Text>End</Text>
                </Button>
              </CardContent>
            </Card>
          )}

        </View>
      </SafeAreaView>
    </View>
  );
}
