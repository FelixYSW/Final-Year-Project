import 'react-native-gesture-handler';
import '../global.css';
import { Stack } from 'expo-router';
import React from 'react';
import { View, Text, Button, SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <SafeAreaView className="flex-1 bg-red-50">
      <View className="flex-1 p-5 justify-center items-center">
        <Text className="text-2xl font-bold text-red-700 mb-2">App Crashed!</Text>
        <Text className="text-base text-gray-700 text-center mb-5">{error.message}</Text>
        <Button title="Try Again" onPress={retry} color="#c62828" />
      </View>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
