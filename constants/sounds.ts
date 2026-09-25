export const ALARM_SOUNDS: Record<string, { label: string; id: string }> = {
  default: { label: 'Default Alarm', id: 'default' },
  gentle: { label: 'Gentle', id: 'gentle' },
  urgent: { label: 'Urgent', id: 'urgent' },
};

export const ALARM_SOUND_LIST = Object.values(ALARM_SOUNDS);
