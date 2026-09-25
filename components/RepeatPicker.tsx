import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedButtons, Text, Chip } from 'react-native-paper';
import { RepeatRule } from '../constants/types';
import { getDayLabel } from '../services/repeatHelper';

interface RepeatPickerProps {
  repeatRule: RepeatRule;
  repeatDays: number[];
  onRuleChange: (rule: RepeatRule) => void;
  onDaysChange: (days: number[]) => void;
}

const REPEAT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6]; // Sun through Sat

export default function RepeatPicker({
  repeatRule,
  repeatDays,
  onRuleChange,
  onDaysChange,
}: RepeatPickerProps) {
  const toggleDay = (day: number) => {
    if (repeatDays.includes(day)) {
      onDaysChange(repeatDays.filter((d) => d !== day));
    } else {
      onDaysChange([...repeatDays, day].sort((a, b) => a - b));
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="labelLarge" style={styles.label}>
        Repeat
      </Text>
      <SegmentedButtons
        value={repeatRule}
        onValueChange={(value) => onRuleChange(value as RepeatRule)}
        buttons={REPEAT_OPTIONS}
        style={styles.segmented}
      />

      {repeatRule === 'weekly' && (
        <View style={styles.daysContainer}>
          <Text variant="labelMedium" style={styles.daysLabel}>
            Repeat on:
          </Text>
          <View style={styles.daysRow}>
            {DAYS_OF_WEEK.map((day) => (
              <Chip
                key={day}
                selected={repeatDays.includes(day)}
                onPress={() => toggleDay(day)}
                style={[
                  styles.dayChip,
                  repeatDays.includes(day) && styles.selectedDayChip,
                ]}
                textStyle={[
                  styles.dayChipText,
                  repeatDays.includes(day) && styles.selectedDayChipText,
                ]}
                compact
              >
                {getDayLabel(day)}
              </Chip>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    marginBottom: 8,
    color: '#475569',
  },
  segmented: {
    marginBottom: 8,
  },
  daysContainer: {
    marginTop: 8,
  },
  daysLabel: {
    color: '#64748B',
    marginBottom: 8,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  dayChip: {
    backgroundColor: '#F1F5F9',
  },
  selectedDayChip: {
    backgroundColor: '#2563EB',
  },
  dayChipText: {
    fontSize: 12,
    color: '#475569',
  },
  selectedDayChipText: {
    color: '#FFFFFF',
  },
});
