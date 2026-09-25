import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, Chip, Switch } from 'react-native-paper';
import { Task } from '../constants/types';
import { formatDisplayDate, formatDisplayTime, getRepeatLabel } from '../services/repeatHelper';
import { theme } from '../constants/theme';

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
  showCompleteAction?: boolean;
}

export default function TaskCard({
  task,
  onPress,
  onComplete,
  onDelete,
  showCompleteAction = true,
}: TaskCardProps) {
  const isOverdue = !task.is_completed && isTaskOverdue(task);

  return (
    <Card
      style={[styles.card, isOverdue && styles.overdueCard]}
      onPress={() => onPress(task)}
      mode="elevated"
    >
      <Card.Content style={styles.content}>
        <View style={styles.mainRow}>
          <View style={styles.textContainer}>
            <Text
              variant="titleMedium"
              style={[
                styles.title,
                task.is_completed && styles.completedTitle,
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            {task.description ? (
              <Text
                variant="bodySmall"
                style={styles.description}
                numberOfLines={1}
              >
                {task.description}
              </Text>
            ) : null}
            <View style={styles.metaRow}>
              <Chip
                icon="calendar"
                compact
                textStyle={styles.chipText}
                style={[styles.chip, isOverdue && styles.overdueChip]}
              >
                {formatDisplayDate(task.due_date)}
              </Chip>
              <Chip
                icon="clock-outline"
                compact
                textStyle={styles.chipText}
                style={styles.chip}
              >
                {formatDisplayTime(task.due_time)}
              </Chip>
              {task.repeat_rule !== 'none' && (
                <Chip
                  icon="repeat"
                  compact
                  textStyle={styles.chipText}
                  style={styles.repeatChip}
                >
                  {getRepeatLabel(task.repeat_rule, task.repeat_days)}
                </Chip>
              )}
            </View>
          </View>
          <View style={styles.actions}>
            {task.alarm_enabled && !task.is_completed && (
              <IconButton
                icon="alarm"
                size={18}
                iconColor={theme.colors.primary}
              />
            )}
            {showCompleteAction && (
              <IconButton
                icon={task.is_completed ? 'undo' : 'check-circle-outline'}
                size={22}
                iconColor={
                  task.is_completed
                    ? theme.colors.secondary
                    : theme.colors.primary
                }
                onPress={() => onComplete(task)}
              />
            )}
            <IconButton
              icon="delete-outline"
              size={22}
              iconColor={theme.colors.error}
              onPress={() => onDelete(task)}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

function isTaskOverdue(task: Task): boolean {
  const [year, month, day] = task.due_date.split('-').map(Number);
  const [hours, minutes] = task.due_time.split(':').map(Number);
  const dueDate = new Date(year, month - 1, day, hours, minutes);
  return dueDate.getTime() < Date.now();
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  content: {
    paddingVertical: 8,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontWeight: '600',
    color: '#0F172A',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  description: {
    color: '#64748B',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  chip: {
    height: 28,
    backgroundColor: '#F1F5F9',
  },
  overdueChip: {
    backgroundColor: '#FEE2E2',
  },
  chipText: {
    fontSize: 11,
  },
  repeatChip: {
    height: 28,
    backgroundColor: '#EDE9FE',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
