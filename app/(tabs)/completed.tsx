import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { Task } from '../../constants/types';
import { useTasks } from '../../hooks/useTasks';
import TaskList from '../../components/TaskList';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function CompletedScreen() {
  const router = useRouter();
  const { completed, loading, refresh, uncompleteTask, removeTask } = useTasks();
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleTaskPress = (task: Task) => {
    router.push(`/task/${task.id}`);
  };

  const handleUncomplete = async (task: Task) => {
    await uncompleteTask(task);
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
        <Appbar.Content title="Completed" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <TaskList
        tasks={completed}
        onTaskPress={handleTaskPress}
        onTaskComplete={handleUncomplete}
        onTaskDelete={handleDelete}
        emptyMessage="No completed tasks yet"
        onRefresh={refresh}
        refreshing={loading}
      />

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
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
});
