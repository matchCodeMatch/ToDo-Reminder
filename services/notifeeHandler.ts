import notifee, { EventType, EventDetail } from '@notifee/react-native';
import { getTaskById, markTaskCompleted, updateTask } from './database';
import { scheduleSnooze, dismissAlarm, scheduleAlarm } from './alarmScheduler';
import { getNextOccurrence } from './repeatHelper';
import { getSettings } from './database';
import { Task } from '../constants/types';

/**
 * Handle notification events in the background.
 * This runs even when the app is killed.
 */
export async function onBackgroundEvent({
  type,
  detail,
}: {
  type: EventType;
  detail: EventDetail;
}) {
  const { notification, pressAction } = detail;
  if (!notification?.data?.taskId) return;

  const taskId = notification.data.taskId as string;

  switch (type) {
    case EventType.ACTION_PRESS:
      if (pressAction?.id === 'dismiss') {
        await handleDismiss(taskId);
      } else if (pressAction?.id === 'snooze') {
        await handleSnooze(taskId);
      }
      break;

    case EventType.DISMISSED:
      // Notification was swiped away — treat as dismiss
      await handleDismiss(taskId);
      break;

    default:
      break;
  }
}

async function handleDismiss(taskId: string) {
  try {
    await dismissAlarm(taskId);
    const task = await getTaskById(taskId);
    if (!task) return;

    if (task.repeat_rule !== 'none') {
      // Schedule next occurrence for repeating tasks
      const next = getNextOccurrence(
        task.due_date,
        task.due_time,
        task.repeat_rule,
        task.repeat_days
      );
      if (next) {
        const updatedTask: Task = {
          ...task,
          due_date: next.date,
          due_time: next.time,
          updated_at: new Date().toISOString(),
        };
        await updateTask(updatedTask);
        await scheduleAlarm(updatedTask);
        return;
      }
    }

    await markTaskCompleted(taskId);
  } catch (error) {
    console.error('Error handling dismiss:', error);
  }
}

async function handleSnooze(taskId: string) {
  try {
    await dismissAlarm(taskId);
    const task = await getTaskById(taskId);
    if (!task) return;

    const settings = await getSettings();
    await scheduleSnooze(task, settings.snooze_duration);
  } catch (error) {
    console.error('Error handling snooze:', error);
  }
}

/**
 * Handle foreground notification events.
 */
export function setupForegroundHandler() {
  return notifee.onForegroundEvent(({ type, detail }) => {
    const { notification, pressAction } = detail;
    if (!notification?.data?.taskId) return;

    // Foreground events are handled by the alarm screen UI
    // This just ensures the notification is properly managed
    if (type === EventType.ACTION_PRESS) {
      if (pressAction?.id === 'dismiss') {
        handleDismiss(notification.data.taskId as string);
      } else if (pressAction?.id === 'snooze') {
        handleSnooze(notification.data.taskId as string);
      }
    }
  });
}
