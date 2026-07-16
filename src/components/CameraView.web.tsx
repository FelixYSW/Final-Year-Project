import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { AlertTriangle, Camera, CameraOff } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { CameraViewStyles as styles } from '@/constants/theme';

export default function CameraView() {
  const videoRef = useRef<any>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [hazardDetected, setHazardDetected] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
        setHasPermission(true);
      })
      .catch(() => setHasPermission(false));

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t: MediaStreamTrack) => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (hasPermission) {
      const interval = setInterval(() => {
        setHazardDetected(true);
        Speech.speak('Warning. Pothole detected ahead.');
        setTimeout(() => setHazardDetected(false), 3000);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [hasPermission]);

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <CameraOff color="#ff4444" size={52} strokeWidth={1.5} />
        <Text style={styles.statusTitle}>Camera Access Denied</Text>
        <Text style={styles.statusSubtitle}>
          Allow camera access in your browser to preview the live feed.
        </Text>
      </View>
    );
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Camera color="#888" size={52} strokeWidth={1.5} />
        <Text style={styles.statusTitle}>Requesting Camera...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {React.createElement('video', {
        ref: videoRef,
        autoPlay: true,
        playsInline: true,
        muted: true,
        style: { width: '100%', height: '100%', objectFit: 'cover' },
      })}
      {hazardDetected && (
        <View style={styles.hazardOverlay}>
          <AlertTriangle color="#fff" size={36} strokeWidth={3} />
          <Text style={styles.hazardText}>POTHOLE DETECTED</Text>
        </View>
      )}
    </View>
  );
}
