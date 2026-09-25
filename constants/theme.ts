import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563EB',
    primaryContainer: '#DBEAFE',
    secondary: '#7C3AED',
    secondaryContainer: '#EDE9FE',
    error: '#DC2626',
    errorContainer: '#FEE2E2',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F5F9',
    background: '#F8FAFC',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#0F172A',
    onSurfaceVariant: '#475569',
    outline: '#CBD5E1',
  },
  roundness: 12,
};

export const ALARM_COLORS = {
  background: '#0F172A',
  text: '#FFFFFF',
  dismissButton: '#DC2626',
  snoozeButton: '#2563EB',
  taskTitle: '#F8FAFC',
  taskDescription: '#94A3B8',
};
