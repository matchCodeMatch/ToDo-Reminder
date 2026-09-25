import React from 'react';
import { View, ScrollView, StyleSheet, Linking, Platform } from 'react-native';
import { Appbar, List, RadioButton, Switch, Text, Divider, Button } from 'react-native-paper';
import notifee from '@notifee/react-native';
import { useSettings } from '../../hooks/useSettings';

const SNOOZE_OPTIONS = [
  { label: '5 minutes', value: 5 },
  { label: '10 minutes', value: 10 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
];

export default function SettingsScreen() {
  const {
    settings,
    setSnoozeDuration,
    setVibrationEnabled,
  } = useSettings();

  const openAlarmSoundSettings = async () => {
    // Opens Android's notification channel settings where the user
    // can pick any sound from their phone for the alarm channel
    try {
      await notifee.openNotificationSettings('reminder-alarm');
    } catch (error) {
      console.error('Error opening notification settings:', error);
      // Fallback: open app notification settings
      if (Platform.OS === 'android') {
        Linking.openSettings();
      }
    }
  };

  const openBatterySettings = async () => {
    try {
      await notifee.openBatteryOptimizationSettings();
    } catch (error) {
      console.error('Error opening battery settings:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header elevated>
        <Appbar.Content title="Settings" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView style={styles.scroll}>
        <List.Section>
          <List.Subheader style={styles.sectionHeader}>
            Snooze Duration
          </List.Subheader>
          <RadioButton.Group
            value={String(settings.snooze_duration)}
            onValueChange={(value) => setSnoozeDuration(parseInt(value, 10))}
          >
            {SNOOZE_OPTIONS.map((option) => (
              <RadioButton.Item
                key={option.value}
                label={option.label}
                value={String(option.value)}
                style={styles.radioItem}
              />
            ))}
          </RadioButton.Group>
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader style={styles.sectionHeader}>
            Alarm Sound
          </List.Subheader>
          <List.Item
            title="Change alarm sound"
            description="Pick any sound from your phone for the alarm"
            left={(props) => <List.Icon {...props} icon="music-note" />}
            onPress={openAlarmSoundSettings}
            style={styles.listItem}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
          <Text variant="bodySmall" style={styles.hint}>
            Opens Android sound settings where you can choose any ringtone or alarm tone
          </Text>
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader style={styles.sectionHeader}>
            Vibration
          </List.Subheader>
          <List.Item
            title="Vibrate on alarm"
            description="Phone vibrates when an alarm fires"
            left={(props) => <List.Icon {...props} icon="vibrate" />}
            right={() => (
              <Switch
                value={settings.vibration_enabled}
                onValueChange={setVibrationEnabled}
              />
            )}
            style={styles.listItem}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader style={styles.sectionHeader}>
            Battery
          </List.Subheader>
          <List.Item
            title="Battery optimization"
            description="Disable battery optimization so alarms fire reliably"
            left={(props) => <List.Icon {...props} icon="battery-alert" />}
            onPress={openBatterySettings}
            style={styles.listItem}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader style={styles.sectionHeader}>About</List.Subheader>
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information-outline" />}
            style={styles.listItem}
          />
          <List.Item
            title="Reminder App"
            description="A personal task reminder with alarm-style alerts"
            left={(props) => <List.Icon {...props} icon="alarm" />}
            style={styles.listItem}
          />
        </List.Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 22,
  },
  scroll: {
    flex: 1,
  },
  sectionHeader: {
    fontWeight: '600',
    color: '#2563EB',
    fontSize: 14,
  },
  radioItem: {
    paddingHorizontal: 16,
  },
  listItem: {
    paddingHorizontal: 16,
  },
  hint: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
});
