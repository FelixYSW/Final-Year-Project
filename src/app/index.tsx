import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { Footprints, Navigation, X } from 'lucide-react-native';
import CameraView from '@/components/CameraView';
import MacroMapView from '@/components/MacroMapView';
import SearchBar from '@/components/SearchBar';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

// App States: 'default' | 'preview' | 'navigating'
type AppState = 'default' | 'preview' | 'navigating';

interface Coords {
  lat: number;
  lng: number;
}

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
      // Fetch real walking distance & duration from Google Directions API
      const origin = 'current_location'; // Will be replaced with real coords from MacroMapView
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${lat}&destination=${lat},${lng}&mode=walking&key=${GOOGLE_MAPS_API_KEY}`
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
    } catch (e) {
      setDistance('N/A');
      setDuration('N/A');
    } finally {
      setIsFetchingRoute(false);
    }
  };

  const startNavigation = () => {
    setAppState('navigating');
  };

  const cancelNavigation = () => {
    setAppState('default');
    setDestination('');
    setDestCoords(null);
    setDistance('');
    setDuration('');
  };

  return (
    <View style={styles.container}>
      {appState === 'default'
        ? <CameraView />
        : <MacroMapView destCoords={destCoords} />
      }

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">

        {/* DEFAULT MODE — Search bar */}
        {appState === 'default' && (
          <SearchBar onPlaceSelected={handlePlaceSelected} />
        )}

        {/* PREVIEW MODE — Route summary card */}
        {appState === 'preview' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle} numberOfLines={2}>{destination}</Text>

            {isFetchingRoute ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#208AEF" />
                <Text style={styles.loadingText}>Calculating route...</Text>
              </View>
            ) : (
              <View style={styles.routeRow}>
                <Footprints color="#208AEF" size={20} />
                <Text style={styles.routeText}>{duration}  •  {distance}</Text>
              </View>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelNavigation} accessibilityLabel="Cancel destination">
                <X color="#fff" size={20} />
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.startButton, isFetchingRoute && styles.disabledButton]}
                onPress={startNavigation}
                disabled={isFetchingRoute}
                accessibilityLabel="Start navigation"
              >
                <Navigation color="#fff" size={20} />
                <Text style={styles.buttonText}>Start Navigation</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* NAVIGATION MODE — Status bar */}
        {appState === 'navigating' && (
          <View style={styles.navBar}>
            <View style={styles.navLeft}>
              <Text style={styles.navTitle} numberOfLines={1}>{destination}</Text>
              <View style={styles.routeRow}>
                <Footprints color="#208AEF" size={16} />
                <Text style={styles.routeTextSmall}>{duration}  •  {distance}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.endButton} onPress={cancelNavigation} accessibilityLabel="End route">
              <X color="#fff" size={20} />
              <Text style={styles.buttonText}>End</Text>
            </TouchableOpacity>
          </View>
        )}

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Preview / Nav shared card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },

  // Route info row
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  routeText: {
    fontSize: 15,
    color: '#208AEF',
    fontWeight: '600',
  },
  routeTextSmall: {
    fontSize: 13,
    color: '#208AEF',
    fontWeight: '600',
  },

  // Loading
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ff4444',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#208AEF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ff4444',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  // Navigation bar
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
    gap: 12,
  },
  navLeft: {
    flex: 1,
    gap: 4,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
});
