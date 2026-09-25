import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../constants/theme';
import {
  setupNotificationChannel,
  requestAlarmPermissions,
  checkBatteryOptimization,
  rescheduleAllAlarms,
} from '../services/alarmScheduler';
import { setupForegroundHandler } from '../services/notifeeHandler';
import { getUpcomingTasks } from '../services/database';

export default function RootLayout() {
  useEffect(() => {
    async function init() {
      console.log('[App] Initializing...');
      await setupNotificationChannel();
      const granted = await requestAlarmPermissions();
      console.log('[App] Notification permission granted:', granted);

      // Just log battery optimization status, don't open settings automatically
      await checkBatteryOptimization();

      // Re-schedule all alarms on app launch (handles boot recovery)
      const tasks = await getUpcomingTasks();
      console.log('[App] Found', tasks.length, 'upcoming tasks');
      await rescheduleAllAlarms(tasks);
      console.log('[App] Init complete');
    }
    init();

    const unsubscribe = setupForegroundHandler();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.onSurface,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="task/create"
          options={{
            title: 'New Task',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="task/[id]"
          options={{
            title: 'Edit Task',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="alarm"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            gestureEnabled: false,
          }}
        />
      </Stack>
    </PaperProvider>
  );
}
