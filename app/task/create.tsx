import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { TextInput, Button, Switch, Text, Snackbar } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { Task, RepeatRule } from '../../constants/types';
import { useTasks } from '../../hooks/useTasks';
import RepeatPicker from '../../components/RepeatPicker';
import { formatDisplayDate, formatDisplayTime } from '../../services/repeatHelper';

export default function CreateTaskScreen() {
  const router = useRouter();
  const { addTask } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [dueTime, setDueTime] = useState(new Date());
  const [repeatRule, setRepeatRule] = useState<RepeatRule>('none');
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const formatDateStr = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatTimeStr = (date: Date): string => {
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${min}`;
  };

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleTimeChange = (_event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setDueTime(selectedTime);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const task: Task = {
        id: Crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        due_date: formatDateStr(dueDate),
        due_time: formatTimeStr(dueTime),
        repeat_rule: repeatRule,
        repeat_days: repeatDays,
        alarm_enabled: alarmEnabled,
        is_completed: false,
        created_at: now,
        updated_at: now,
      };

      await addTask(task);

      // Check if the scheduled time is in the past
      const [y, mo, d] = task.due_date.split('-').map(Number);
      const [h, mi] = task.due_time.split(':').map(Number);
      const scheduledTime = new Date(y, mo - 1, d, h, mi, 0);
      if (alarmEnabled && scheduledTime.getTime() <= Date.now()) {
        console.log('[CreateTask] Warning: alarm time is in the past, alarm will not fire');
      }

      router.back();
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <TextInput
          label="Task Title *"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
          placeholder="What do you need to do?"
          autoFocus
        />

        <TextInput
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          style={styles.input}
          placeholder="Add details..."
          multiline
          numberOfLines={3}
        />

        <View style={styles.pickerRow}>
          <Text variant="labelLarge" style={styles.pickerLabel}>
            Due Date
          </Text>
          <Button
            mode="outlined"
            icon="calendar"
            onPress={() => setShowDatePicker(true)}
            style={styles.pickerButton}
          >
            {formatDisplayDate(formatDateStr(dueDate))}
          </Button>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        <View style={styles.pickerRow}>
          <Text variant="labelLarge" style={styles.pickerLabel}>
            Due Time
          </Text>
          <Button
            mode="outlined"
            icon="clock-outline"
            onPress={() => setShowTimePicker(true)}
            style={styles.pickerButton}
          >
            {formatDisplayTime(formatTimeStr(dueTime))}
          </Button>
        </View>

        {showTimePicker && (
          <DateTimePicker
            value={dueTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}

        <RepeatPicker
          repeatRule={repeatRule}
          repeatDays={repeatDays}
          onRuleChange={setRepeatRule}
          onDaysChange={setRepeatDays}
        />

        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Text variant="labelLarge" style={styles.switchText}>
              Alarm Enabled
            </Text>
            <Text variant="bodySmall" style={styles.switchDescription}>
              Get a loud alarm at the scheduled time
            </Text>
          </View>
          <Switch value={alarmEnabled} onValueChange={setAlarmEnabled} />
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          labelStyle={styles.saveButtonLabel}
        >
          Create Task
        </Button>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        action={{ label: 'OK', onPress: () => setError('') }}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  pickerLabel: {
    color: '#475569',
  },
  pickerButton: {
    minWidth: 160,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 12,
    marginBottom: 24,
  },
  switchLabel: {
    flex: 1,
  },
  switchText: {
    color: '#475569',
  },
  switchDescription: {
    color: '#94A3B8',
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
