export type RepeatRule = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string; // 'YYYY-MM-DD'
  due_time: string; // 'HH:MM'
  repeat_rule: RepeatRule;
  repeat_days: number[]; // 0=Sun, 1=Mon, ... 6=Sat
  alarm_enabled: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  snooze_duration: number; // minutes
  alarm_sound: string;
  vibration_enabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  snooze_duration: 5,
  alarm_sound: 'default',
  vibration_enabled: true,
};
