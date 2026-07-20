import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { AlertTriangle, Camera as CameraIcon, CameraOff, CornerUpLeft, ArrowUp } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { StyleSheet } from 'react-native';

interface Props {
  isNavigating?: boolean;
  destination?: string;
}

export default function CameraView({ isNavigating, destination }: Props) {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isActive] = useState(true);
  const [hazardDetected, setHazardDetected] = useState(false);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    if (isActive && hasPermission) {
      const interval = setInterval(() => {
        setHazardDetected(true);
        Speech.speak('Warning. Pothole detected ahead.');
        setTimeout(() => setHazardDetected(false), 3000);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [isActive, hasPermission]);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <CameraOff color="#ff4444" size={52} strokeWidth={1.5} />
        <Text style={styles.statusTitle}>No Camera Permission</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.container}>
        <CameraIcon color="#888" size={52} strokeWidth={1.5} />
        <Text style={styles.statusTitle}>No Camera Device Found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={{ flex: 1 }}
        device={device}
        isActive={isActive}
        video={false}
      />
      {hazardDetected && (
        <View style={styles.hazardOverlay}>
          <AlertTriangle color="#fff" size={36} strokeWidth={3} />
          <Text style={styles.hazardText}>POTHOLE DETECTED</Text>
        </View>
      )}
      {isNavigating && (
        <View style={styles.arOverlay}>
          <View style={styles.directionCard}>
            <CornerUpLeft color="#fff" size={42} strokeWidth={2.5} />
            <View style={styles.directionTextContainer}>
              <Text style={styles.distanceText}>150 m</Text>
              <Text style={styles.instructionText}>Turn left towards {destination || 'Destination'}</Text>
            </View>
          </View>
          <View style={styles.arPathWrapper}>
            <ArrowUp color="rgba(32, 138, 239, 0.8)" size={140} strokeWidth={3} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  statusTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  hazardOverlay: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    gap: 8,
  },
  hazardText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  arOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    pointerEvents: 'none',
  },
  directionCard: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  directionTextContainer: {
    flex: 1,
  },
  distanceText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  instructionText: {
    color: '#ddd',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  arPathWrapper: {
    position: 'absolute',
    bottom: '25%',
    alignSelf: 'center',
    transform: [{ perspective: 500 }, { rotateX: '60deg' }],
  },
});
