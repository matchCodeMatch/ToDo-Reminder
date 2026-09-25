import notifee, {
  AndroidImportance,
  AndroidCategory,
  TriggerType,
  TimestampTrigger,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import { Task } from '../constants/types';

const CHANNEL_ID = 'reminder-alarm';
const CHANNEL_NAME = 'Task Alarms';

/**
 * Create the notification channel for alarms (Android requirement).
 */
export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await notifee.createChannel({
    id: CHANNEL_ID,
    name: CHANNEL_NAME,
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
    bypassDnd: true,
  });
  console.log('[Alarm] Notification channel created');
}

/**
 * Request necessary permissions for notifications and alarms.
 */
export async function requestAlarmPermissions(): Promise<boolean> {
  try {
    const notifSettings = await notifee.requestPermission();
    console.log('[Alarm] Notification permission status:', notifSettings.authorizationStatus);
    return notifSettings.authorizationStatus >= 1;
  } catch (error) {
    console.error('[Alarm] Error requesting permissions:', error);
    return false;
  }
}

/**
 * Check and prompt for battery optimization (call separately, not on first launch).
 */
export async function checkBatteryOptimization(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const enabled = await notifee.isBatteryOptimizationEnabled();
    if (enabled) {
      console.log('[Alarm] Battery optimization is enabled - alarms may be unreliable');
    }
  } catch (error) {
    console.error('[Alarm] Error checking battery optimization:', error);
  }
}

/**
 * Schedule an alarm for a task.
 * Returns true if scheduled, false if skipped (e.g. past time).
 */
export async function scheduleAlarm(task: Task): Promise<boolean> {
  if (!task.alarm_enabled || task.is_completed) {
    console.log('[Alarm] Skipping - alarm disabled or task completed:', task.id);
    return false;
  }

  const [year, month, day] = task.due_date.split('-').map(Number);
  const [hours, minutes] = task.due_time.split(':').map(Number);
  const triggerDate = new Date(year, month - 1, day, hours, minutes, 0);
  const now = Date.now();

  if (triggerDate.getTime() <= now) {
    console.log('[Alarm] Skipping past alarm:', task.title,
      '| Trigger:', triggerDate.toISOString(),
      '| Now:', new Date(now).toISOString());
    return false;
  }

  console.log('[Alarm] Scheduling alarm for:', task.title,
    '| At:', triggerDate.toISOString(),
    '| In:', Math.round((triggerDate.getTime() - now) / 1000), 'seconds');

  try {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerDate.getTime(),
      alarmManager: {
        allowWhileIdle: true,
      },
    };

    await notifee.createTriggerNotification(
      {
        id: task.id,
        title: 'Reminder',
        body: task.title,
        data: {
          taskId: task.id,
          taskTitle: task.title,
          taskDescription: task.description || '',
        },
        android: {
          channelId: CHANNEL_ID,
          category: AndroidCategory.ALARM,
          importance: AndroidImportance.HIGH,
          sound: 'default',
          fullScreenAction: {
            id: 'default',
            launchActivity: 'default',
          },
          loopSound: true,
          ongoing: true,
          autoCancel: false,
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          actions: [
            {
              title: 'Dismiss',
              pressAction: { id: 'dismiss' },
            },
            {
              title: 'Snooze',
              pressAction: { id: 'snooze' },
            },
          ],
        },
      },
      trigger
    );

    // Verify it was scheduled
    const triggers = await notifee.getTriggerNotificationIds();
    console.log('[Alarm] Currently scheduled trigger IDs:', triggers);
    return true;
  } catch (error) {
    console.error('[Alarm] ERROR scheduling alarm:', error);
    return false;
  }
}

/**
 * Cancel a scheduled alarm for a task.
 */
export async function cancelAlarm(taskId: string): Promise<void> {
  try {
    await notifee.cancelNotification(taskId);
    await notifee.cancelTriggerNotification(taskId);
    console.log('[Alarm] Cancelled alarm:', taskId);
  } catch (error) {
    console.error('[Alarm] Error cancelling alarm:', error);
  }
}

/**
 * Schedule a snooze alarm (fires again after X minutes).
 */
export async function scheduleSnooze(
  task: Task,
  snoozeDurationMinutes: number
): Promise<void> {
  const snoozeTime = Date.now() + snoozeDurationMinutes * 60 * 1000;
  console.log('[Alarm] Scheduling snooze for:', task.title, '| In:', snoozeDurationMinutes, 'minutes');

  try {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: snoozeTime,
      alarmManager: {
        allowWhileIdle: true,
      },
    };

    await notifee.createTriggerNotification(
      {
        id: `${task.id}-snooze`,
        title: 'Snoozed Reminder',
        body: task.title,
        data: {
          taskId: task.id,
          taskTitle: task.title,
          taskDescription: task.description || '',
        },
        android: {
          channelId: CHANNEL_ID,
          category: AndroidCategory.ALARM,
          importance: AndroidImportance.HIGH,
          sound: 'default',
          fullScreenAction: {
            id: 'default',
            launchActivity: 'default',
          },
          loopSound: true,
          ongoing: true,
          autoCancel: false,
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          actions: [
            {
              title: 'Dismiss',
              pressAction: { id: 'dismiss' },
            },
            {
              title: 'Snooze',
              pressAction: { id: 'snooze' },
            },
          ],
        },
      },
      trigger
    );
    console.log('[Alarm] Snooze scheduled successfully');
  } catch (error) {
    console.error('[Alarm] Error scheduling snooze:', error);
  }
}

/**
 * Dismiss a currently firing alarm notification.
 */
export async function dismissAlarm(taskId: string): Promise<void> {
  await notifee.cancelNotification(taskId);
  await notifee.cancelNotification(`${taskId}-snooze`);
  console.log('[Alarm] Dismissed alarm:', taskId);
}

/**
 * Re-schedule all pending alarms from the database.
 */
export async function rescheduleAllAlarms(tasks: Task[]): Promise<void> {
  console.log('[Alarm] Re-scheduling all alarms. Task count:', tasks.length);
  await notifee.cancelAllNotifications();

  let scheduled = 0;
  for (const task of tasks) {
    if (!task.is_completed && task.alarm_enabled) {
      const result = await scheduleAlarm(task);
      if (result) scheduled++;
    }
  }
  console.log('[Alarm] Re-scheduled', scheduled, 'alarms');
}
