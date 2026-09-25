import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { FAB, Text, Appbar } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { Task } from '../../constants/types';
import { useTasks } from '../../hooks/useTasks';
import TaskList from '../../components/TaskList';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function UpcomingScreen() {
  const router = useRouter();
  const { upcoming, loading, refresh, completeTask, removeTask } = useTasks();
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleTaskPress = (task: Task) => {
    router.push(`/task/${task.id}`);
  };

  const handleComplete = async (task: Task) => {
    await completeTask(task);
  };

  const handleDelete = (task: Task) => {
    setDeleteTarget(task);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await removeTask(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header elevated>
        <Appbar.Content title="Reminder" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <TaskList
        tasks={upcoming}
        onTaskPress={handleTaskPress}
        onTaskComplete={handleComplete}
        onTaskDelete={handleDelete}
        emptyMessage="No upcoming tasks. Tap + to add one!"
        onRefresh={refresh}
        refreshing={loading}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/task/create')}
        label="New Task"
      />

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will also cancel any scheduled alarm.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        destructive
      />
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2563EB',
  },
});
