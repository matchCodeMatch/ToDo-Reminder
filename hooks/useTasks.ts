import { useState, useEffect, useCallback } from 'react';
import { Task } from '../constants/types';
import {
  getUpcomingTasks,
  getCompletedTasks,
  createTask,
  updateTask,
  deleteTask,
  markTaskCompleted,
  markTaskIncomplete,
} from '../services/database';
import {
  scheduleAlarm,
  cancelAlarm,
} from '../services/alarmScheduler';
import { getNextOccurrence } from '../services/repeatHelper';

export function useTasks() {
  const [upcoming, setUpcoming] = useState<Task[]>([]);
  const [completed, setCompleted] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [upcomingData, completedData] = await Promise.all([
        getUpcomingTasks(),
        getCompletedTasks(),
      ]);
      setUpcoming(upcomingData);
      setCompleted(completedData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTask = useCallback(
    async (task: Task) => {
      await createTask(task);
      if (task.alarm_enabled) {
        await scheduleAlarm(task);
      }
      await refresh();
    },
    [refresh]
  );

  const editTask = useCallback(
    async (task: Task) => {
      await cancelAlarm(task.id);
      await updateTask(task);
      if (task.alarm_enabled && !task.is_completed) {
        await scheduleAlarm(task);
      }
      await refresh();
    },
    [refresh]
  );

  const removeTask = useCallback(
    async (id: string) => {
      await cancelAlarm(id);
      await deleteTask(id);
      await refresh();
    },
    [refresh]
  );

  const completeTask = useCallback(
    async (task: Task) => {
      await cancelAlarm(task.id);

      // If repeating, schedule the next occurrence instead of completing
      if (task.repeat_rule !== 'none') {
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
          if (updatedTask.alarm_enabled) {
            await scheduleAlarm(updatedTask);
          }
          await refresh();
          return;
        }
      }

      await markTaskCompleted(task.id);
      await refresh();
    },
    [refresh]
  );

  const uncompleteTask = useCallback(
    async (task: Task) => {
      await markTaskIncomplete(task.id);
      if (task.alarm_enabled) {
        await scheduleAlarm(task);
      }
      await refresh();
    },
    [refresh]
  );

  return {
    upcoming,
    completed,
    loading,
    refresh,
    addTask,
    editTask,
    removeTask,
    completeTask,
    uncompleteTask,
  };
}
