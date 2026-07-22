import React, { useRef, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import type { Route } from '@/app/index';

interface Props {
  currentCoords?: { lat: number; lng: number } | null;
  destCoords?: { lat: number; lng: number } | null;
  allRoutes?: Route[];
  selectedRouteIndex?: number;
  onRouteSelect?: (index: number) => void;
}

// Colours for each route state
const SELECTED_COLOR = '#1a73e8';   // Google blue
const ALT_COLOR = '#9DB9E8';        // Muted blue-grey for alternatives

export default function MacroMapView({
  currentCoords,
  destCoords,
  allRoutes = [],
  selectedRouteIndex = 0,
  onRouteSelect,
}: Props) {
  const mapRef = useRef<MapView>(null);

  // Auto-fit whenever the selected route or destination changes
  useEffect(() => {
    const selected = allRoutes[selectedRouteIndex];
    if (!mapRef.current) return;

    if (selected && selected.coords.length > 1) {
      // Fit to the selected route's points
      mapRef.current.fitToCoordinates(selected.coords, {
        edgePadding: { top: 80, right: 50, bottom: 80, left: 50 },
        animated: true,
      });
    } else if (currentCoords && destCoords) {
      // Fallback: fit origin → destination
      mapRef.current.fitToCoordinates(
        [
          { latitude: currentCoords.lat, longitude: currentCoords.lng },
          { latitude: destCoords.lat, longitude: destCoords.lng },
        ],
        { edgePadding: { top: 80, right: 50, bottom: 80, left: 50 }, animated: true }
      );
    }
  }, [allRoutes, selectedRouteIndex, destCoords]);

  if (!currentCoords) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#208AEF" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: currentCoords.lat,
          longitude: currentCoords.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsCompass={false}
        showsMyLocationButton={false}
        showsScale={false}
        showsPointsOfInterest={true}
        toolbarEnabled={false}
        zoomControlEnabled={false}
        mapType="standard"
      >
        {/* Draw alternative routes first (underneath selected) */}
        {allRoutes.map((route, index) => {
          if (index === selectedRouteIndex) return null; // drawn last (on top)
          return (
            <Polyline
              key={`alt-route-${index}`}
              coordinates={route.coords}
              strokeColor={ALT_COLOR}
              strokeWidth={5}
              tappable={true}
              onPress={() => onRouteSelect?.(index)}
            />
          );
        })}

        {/* Draw selected route on top in blue */}
        {allRoutes[selectedRouteIndex] && allRoutes[selectedRouteIndex].coords.length > 1 && (
          <Polyline
            key={`selected-route-${selectedRouteIndex}`}
            coordinates={allRoutes[selectedRouteIndex].coords}
            strokeColor={SELECTED_COLOR}
            strokeWidth={6}
            lineDashPattern={undefined}
          />
        )}

        {/* Destination marker */}
        {destCoords && (
          <Marker
            coordinate={{ latitude: destCoords.lat, longitude: destCoords.lng }}
            title="Destination"
            pinColor="#208AEF"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    gap: 12,
  },
  loadingText: {
    color: '#555',
    fontSize: 15,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
