import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { MapViewStyles as styles } from '@/constants/theme';

const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.GOOGLE_MAPS_API_KEY ||
  '';

interface Props {
  destCoords?: { lat: number; lng: number } | null;
}

export default function MacroMapView({ destCoords }: Props) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords({ lat: 3.139, lng: 101.6869 }) // fallback to KL
    );
  }, []);

  if (!coords) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#208AEF" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  const mapSrc = destCoords
    ? `https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_MAPS_API_KEY}&origin=${coords.lat},${coords.lng}&destination=${destCoords.lat},${destCoords.lng}&mode=walking`
    : `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${coords.lat},${coords.lng}&zoom=17&maptype=roadmap`;

  return (
    <View style={styles.container}>
      {React.createElement('iframe', {
        src: mapSrc,
        style: { width: '100%', height: '100%', border: 'none' },
        allowFullScreen: true,
        loading: 'lazy',
      })}
    </View>
  );
}
