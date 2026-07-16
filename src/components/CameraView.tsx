import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { AlertTriangle } from 'lucide-react-native';
import * as Speech from 'expo-speech';

export default function CameraView() {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isActive] = useState(true);
  const [hazardDetected, setHazardDetected] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Simulate hazard detection every 15 seconds (placeholder until real AI model is added)
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
        <Text style={styles.text}>No Camera Permission</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No Camera Device Found</Text>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        video={false}
      />

      {/* High Contrast UI for Hazard Alert */}
      {hazardDetected && (
        <View style={styles.hazardOverlay}>
          <AlertTriangle color="#fff" size={36} strokeWidth={3} />
          <Text style={styles.hazardText}>POTHOLE DETECTED</Text>
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
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
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
  },
  hazardText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
});
