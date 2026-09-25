import notifee from '@notifee/react-native';
import { onBackgroundEvent } from './services/notifeeHandler';

// Register background event handler for notifee
// This must be called at the top level, outside any component
notifee.onBackgroundEvent(onBackgroundEvent);

import 'expo-router/entry';
