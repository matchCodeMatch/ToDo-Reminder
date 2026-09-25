import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Vibration } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ALARM_COLORS } from '../constants/theme';
import { dismissAlarm, scheduleSnooze } from '../services/alarmScheduler';
import { getTaskById } from '../services/database';
import { useTasks } from '../hooks/useTasks';
import { useSettings } from '../hooks/useSettings';
import { Task } from '../constants/types';

export default function AlarmScreen() {
  const router = useRouter();
  const { taskId, taskTitle, taskDescription } = useLocalSearchParams<{
    taskId: string;
    taskTitle: string;
    taskDescription: string;
  }>();
  const { completeTask } = useTasks();
  const { settings } = useSettings();
  const [task, setTask] = useState<Task | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update clock every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Start vibration pattern
    if (settings.vibration_enabled) {
      const pattern = [0, 500, 200, 500, 200, 500, 1000];
      Vibration.vibrate(pattern, true);
    }

    return () => {
      clearInterval(timer);
      Vibration.cancel();
    };
  }, [settings.vibration_enabled]);

  useEffect(() => {
    async function loadTask() {
      if (taskId) {
        const found = await getTaskById(taskId);
        setTask(found);
      }
    }
    loadTask();
  }, [taskId]);

  const handleDismiss = async () => {
    Vibration.cancel();
    if (taskId) {
      await dismissAlarm(taskId);
      if (task) {
        await completeTask(task);
      }
    }
    router.replace('/');
  };

  const handleSnooze = async () => {
    Vibration.cancel();
    if (taskId && task) {
      await dismissAlarm(taskId);
      await scheduleSnooze(task, settings.snooze_duration);
    }
    router.replace('/');
  };

  const formatClock = (date: Date): string => {
    const hours = date.getHours() % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `${hours}:${minutes} ${ampm}`;
  };

  const displayTitle = taskTitle || task?.title || 'Reminder';
  const displayDescription = taskDescription || task?.description || '';

  return (
    <View style={styles.container}>
      <View style={styles.clockContainer}>
        <Text style={styles.clock}>{formatClock(currentTime)}</Text>
      </View>

      <View style={styles.alarmIcon}>
        <IconButton
          icon="alarm"
          size={64}
          iconColor={ALARM_COLORS.text}
        />
      </View>

      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle} numberOfLines={2}>
          {displayTitle}
        </Text>
        {displayDescription ? (
          <Text style={styles.taskDescription} numberOfLines={3}>
            {displayDescription}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleSnooze}
          style={styles.snoozeButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon="alarm-snooze"
        >
          Snooze ({settings.snooze_duration} min)
        </Button>

        <Button
          mode="contained"
          onPress={handleDismiss}
          style={styles.dismissButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon="alarm-off"
        >
          Dismiss
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ALARM_COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  clockContainer: {
    marginBottom: 24,
  },
  clock: {
    fontSize: 56,
    fontWeight: '200',
    color: ALARM_COLORS.text,
    letterSpacing: 2,
  },
  alarmIcon: {
    marginBottom: 24,
  },
  taskInfo: {
    alignItems: 'center',
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  taskTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: ALARM_COLORS.taskTitle,
    textAlign: 'center',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 16,
    color: ALARM_COLORS.taskDescription,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    width: '100%',
    gap: 16,
  },
  snoozeButton: {
    backgroundColor: ALARM_COLORS.snoozeButton,
    borderRadius: 16,
  },
  dismissButton: {
    backgroundColor: ALARM_COLORS.dismissButton,
    borderRadius: 16,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
