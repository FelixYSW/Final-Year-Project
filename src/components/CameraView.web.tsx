import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { AlertTriangle, Camera, CameraOff, CornerUpLeft, ArrowUp } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { StyleSheet } from 'react-native';

interface Props {
  isNavigating?: boolean;
  destination?: string;
}

export default function CameraView({ isNavigating, destination }: Props) {
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
  statusSubtitle: {
    color: '#999',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
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
