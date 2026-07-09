import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { Footprints } from 'lucide-react-native';
import CameraView from '@/components/CameraView';
import MacroMapView from '@/components/MacroMapView';

export default function App() {
  const [destination, setDestination] = useState('');
  
  // App States: 'default' | 'preview' | 'navigating'
  const [appState, setAppState] = useState<'default' | 'preview' | 'navigating'>('default');
  
  // Routing Details
  const [distance, setDistance] = useState('0 m');
  const [duration, setDuration] = useState('0 mins');

  const handleSearch = () => {
    if (destination.trim()) {
      // Move from Default -> Preview
      // (Later we will fetch real Directions API data here and set distance/duration)
      setDistance('1.2 km'); // Dummy data for UI
      setDuration('15 mins'); // Dummy data for UI
      setAppState('preview');
    }
  };

  const startNavigation = () => {
    // Move from Preview -> Navigating
    setAppState('navigating');
  };

  const cancelNavigation = () => {
    // Return to Default
    setAppState('default');
    setDestination('');
    setDistance('0 m');
    setDuration('0 mins');
  };

  return (
    <View style={styles.container}>
      {/* 
        Background Layer: 
        If in default mode, show Camera.
        If previewing or navigating, show the Map.
      */}
      {appState === 'default' ? <CameraView /> : <MacroMapView />}

      <SafeAreaView style={styles.overlay}>
        {appState === 'default' && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Where to?"
              placeholderTextColor="#666"
              value={destination}
              onChangeText={setDestination}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.goButton} onPress={handleSearch}>
              <Text style={styles.goButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        )}

        {appState === 'preview' && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Destination: {destination}</Text>
            <View style={styles.routeDetailsRow}>
              <Footprints color="#007AFF" size={20} />
              <Text style={styles.routeDetailsText}> {duration} ({distance})</Text>
            </View>
            
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelNavigation}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.startButton} onPress={startNavigation}>
                <Text style={styles.buttonText}>Start Navigation</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {appState === 'navigating' && (
          <View style={styles.navHeader}>
            <View style={styles.navHeaderLeft}>
              <Text style={styles.navText}>Navigating to: {destination}</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 2}}>
                <Footprints color="#007AFF" size={16} />
                <Text style={styles.navSubText}> {duration} ({distance})</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelNavigation}>
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
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: '#000',
  },
  goButton: {
    backgroundColor: '#208AEF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 10,
  },
  goButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  routeDetailsRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  routeDetailsText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  startButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  navHeaderLeft: {
    flex: 1,
  },
  navText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  navSubText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 2,
  },
});
