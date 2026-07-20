import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.GOOGLE_MAPS_API_KEY ||
  '';

interface Props {
  currentCoords?: { lat: number; lng: number } | null;
  destCoords?: { lat: number; lng: number } | null;
}

export default function MacroMapView({ currentCoords, destCoords }: Props) {
  if (!currentCoords) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#208AEF" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  const mapSrc = destCoords
    ? `https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_MAPS_API_KEY}&origin=${currentCoords.lat},${currentCoords.lng}&destination=${destCoords.lat},${destCoords.lng}&mode=walking`
    : `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${currentCoords.lat},${currentCoords.lng}&zoom=17&maptype=roadmap`;

  return (
    <View style={[styles.container, { overflow: 'hidden' }]}>
      {React.createElement('iframe', {
        src: mapSrc,
        style: {
          width: '100%',
          // Clip top bar (~105px: origin/destination inputs + More options) and
          // bottom bar (~70px: satellite btn, zoom, keyboard shortcuts, terms/logo).
          // Total extra = 175px. Shift up by 105px so top is clipped, bottom -70px also clipped.
          height: 'calc(100% + 175px)',
          marginTop: -105,
          border: 'none',
          display: 'block',
        },
        allowFullScreen: true,
        loading: 'lazy',
      })}
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
});
