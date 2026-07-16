import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { AlertTriangle, Camera as CameraIcon, CameraOff } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { CameraViewStyles as styles } from '@/constants/theme';

export default function CameraView() {
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
    </View>
  );
}
