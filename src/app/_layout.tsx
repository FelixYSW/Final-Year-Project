import { Stack } from 'expo-router';
import React from 'react';
import { View, Text, Button, SafeAreaView } from 'react-native';

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
        <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 30 }}>
          Take a screenshot of this error and show it to Felix!
        </Text>
        <Button title="Try Again" onPress={retry} color="#c62828" />
      </View>
    </SafeAreaView>
  );
}

export default function TabLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
