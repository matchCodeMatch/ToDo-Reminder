import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Task } from '../constants/types';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
  onTaskComplete: (task: Task) => void;
  onTaskDelete: (task: Task) => void;
  emptyMessage?: string;
  showCompleteAction?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function TaskList({
  tasks,
  onTaskPress,
  onTaskComplete,
  onTaskDelete,
  emptyMessage = 'No tasks yet',
  showCompleteAction = true,
  onRefresh,
  refreshing = false,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="headlineMedium" style={styles.emptyIcon}>
          {showCompleteAction ? '📋' : '🎉'}
        </Text>
        <Text variant="bodyLarge" style={styles.emptyText}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TaskCard
          task={item}
          onPress={onTaskPress}
          onComplete={onTaskComplete}
          onDelete={onTaskDelete}
          showCompleteAction={showCompleteAction}
        />
      )}
      contentContainerStyle={styles.list}
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
  },
});
