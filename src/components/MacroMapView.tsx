import React, { useRef, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

interface Props {
  currentCoords?: { lat: number; lng: number } | null;
  destCoords?: { lat: number; lng: number } | null;
  routeCoords?: { latitude: number; longitude: number }[];
}

export default function MacroMapView({ currentCoords, destCoords, routeCoords }: Props) {
  const mapRef = useRef<MapView>(null);

  // Auto-fit the map to show all route points whenever the route changes
  useEffect(() => {
    if (mapRef.current && routeCoords && routeCoords.length > 1) {
      mapRef.current.fitToCoordinates(routeCoords, {
        edgePadding: { top: 60, right: 40, bottom: 60, left: 40 },
        animated: true,
      });
    } else if (mapRef.current && currentCoords && destCoords) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: currentCoords.lat, longitude: currentCoords.lng },
          { latitude: destCoords.lat, longitude: destCoords.lng },
        ],
        { edgePadding: { top: 80, right: 40, bottom: 80, left: 40 }, animated: true }
      );
    }
  }, [routeCoords, destCoords]);

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
        {destCoords && (
          <Marker
            coordinate={{ latitude: destCoords.lat, longitude: destCoords.lng }}
            title="Destination"
            pinColor="#208AEF"
          />
        )}
        {routeCoords && routeCoords.length > 1 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#1a73e8"
            strokeWidth={5}
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


