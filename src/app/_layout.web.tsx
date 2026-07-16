import { Stack } from 'expo-router';
import React from 'react';
import { View, Text, Button, SafeAreaView, StyleSheet } from 'react-native';
import { Wifi, Signal, BatteryFull } from 'lucide-react-native';

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffebee' }}>
      <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#c62828', marginBottom: 10 }}>
          App Crashed!
        </Text>
        <Text style={{ fontSize: 16, color: '#333', textAlign: 'center', marginBottom: 20 }}>
          {error.message}
        </Text>
        <Button title="Try Again" onPress={retry} color="#c62828" />
      </View>
    </SafeAreaView>
  );
}

// iPhone 16 dimensions
const PHONE_W = 393;
const PHONE_H = 852;

function StatusBar() {
  const [time, setTime] = React.useState('');
  React.useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.statusBar}>
      <Text style={styles.statusTime}>{time}</Text>
      <View style={styles.dynamicIsland} />
      <View style={styles.statusIcons}>
          <Signal color="#fff" size={14} />
          <Wifi color="#fff" size={14} />
          <BatteryFull color="#fff" size={14} />
        </View>
    </View>
  );
}

export default function WebLayout() {
  return (
    <View style={styles.desktop}>
      <View style={styles.label}>
        <Text style={styles.labelText}>iPhone 16 Simulator — Web Preview</Text>
        <Text style={styles.labelSub}>Camera & GPS require a real device</Text>
      </View>
      <View style={styles.phoneOuter}>
        {/* Side buttons */}
        <View style={[styles.sideButton, { top: 120, left: -4, height: 36 }]} />
        <View style={[styles.sideButton, { top: 170, left: -4, height: 64 }]} />
        <View style={[styles.sideButton, { top: 248, left: -4, height: 64 }]} />
        <View style={[styles.sideButton, { top: 160, right: -4, height: 80 }]} />

        <View style={styles.phoneScreen}>
          <StatusBar />
          <View style={styles.appArea}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack>
          </View>
          <View style={styles.homeBar} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desktop: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh' as any,
  },
  label: {
    alignItems: 'center',
    marginBottom: 24,
  },
  labelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  labelSub: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  phoneOuter: {
    width: PHONE_W + 24,
    height: PHONE_H + 24,
    backgroundColor: '#1c1c1e',
    borderRadius: 56,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.8,
    shadowRadius: 60,
    borderWidth: 1,
    borderColor: '#3a3a3c',
    position: 'relative',
  },
  sideButton: {
    position: 'absolute',
    width: 4,
    backgroundColor: '#2c2c2e',
    borderRadius: 2,
    zIndex: 10,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 46,
    overflow: 'hidden',
  },
  statusBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  statusTime: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    width: 60,
  },
  dynamicIsland: {
    width: 120,
    height: 34,
    backgroundColor: '#000',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2c2c2e',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 60,
    justifyContent: 'flex-end',
  },
  appArea: {
    flex: 1,
    marginTop: 54,
    marginBottom: 34,
  },
  homeBar: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
