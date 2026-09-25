import { useState, useEffect, useCallback } from 'react';
import { Settings, DEFAULT_SETTINGS } from '../constants/types';
import { getSettings, updateSetting } from '../services/database';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setSnoozeDuration = useCallback(
    async (minutes: number) => {
      await updateSetting('snooze_duration', String(minutes));
      setSettings((prev) => ({ ...prev, snooze_duration: minutes }));
    },
    []
  );

  const setAlarmSound = useCallback(
    async (sound: string) => {
      await updateSetting('alarm_sound', sound);
      setSettings((prev) => ({ ...prev, alarm_sound: sound }));
    },
    []
  );

  const setVibrationEnabled = useCallback(
    async (enabled: boolean) => {
      await updateSetting('vibration_enabled', enabled ? '1' : '0');
      setSettings((prev) => ({ ...prev, vibration_enabled: enabled }));
    },
    []
  );

  return {
    settings,
    loading,
    refresh,
    setSnoozeDuration,
    setAlarmSound,
    setVibrationEnabled,
  };
}
