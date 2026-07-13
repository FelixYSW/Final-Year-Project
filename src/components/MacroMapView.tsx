import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

interface Props {
  destCoords?: { lat: number; lng: number } | null;
}

export default function MacroMapView({ destCoords }: Props) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied. Please enable it in Settings.');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
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
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: destCoords ? 0.05 : 0.01,
          longitudeDelta: destCoords ? 0.05 : 0.01,
        }}
        showsUserLocation={true}
        followsUserLocation={!destCoords} // Stop following when showing a destination
        showsCompass={true}
        showsMyLocationButton={true}
      >
        {/* Destination pin */}
        {destCoords && (
          <Marker
            coordinate={{
              latitude: destCoords.lat,
              longitude: destCoords.lng,
            }}
            title="Destination"
            pinColor="#208AEF"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    gap: 12,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
    fontWeight: '600',
  },
  loadingText: {
    color: '#666',
    fontSize: 15,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
