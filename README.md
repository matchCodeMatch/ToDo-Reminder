# Reminder App

A personal Android todo + alarm reminder app. Create tasks with scheduled dates/times and get a full-screen, loud alarm (like an alarm clock) when it's time — not just a passive notification.

## Features

- **Task Management**: Create, edit, delete, and complete tasks
- **Full-Screen Alarm**: Loud, persistent alarm with full-screen UI on Android (works even when phone is locked)
- **Snooze**: Snooze alarms for 5/10/15/30 minutes
- **Repeat Tasks**: Daily, weekly (pick specific days), or monthly recurrence
- **Local Storage**: All data stored on-device using SQLite — no server, no account needed
- **Battery Friendly**: Handles battery optimization prompts and exact alarm permissions

## Tech Stack

- **React Native** + **Expo** (with dev client)
- **TypeScript**
- **expo-sqlite** for local database
- **notifee** for alarm-style notifications
- **React Native Paper** for Material Design UI
- **Expo Router** for file-based navigation

## Getting Started

### Prerequisites

- Node.js 18+
- Android device or Android Studio emulator
- Expo CLI

### Install

```bash
cd reminder-app
npm install
```

### Run in Development

```bash
# Start the Expo dev server
npx expo start

# Or run directly on Android
npx expo run:android
```

### Build APK (for installing on your phone)

```bash
# Install EAS CLI
npm install -g eas-cli

# Build a preview APK
eas build --platform android --profile preview
```

This will generate an `.apk` file you can download and install directly on your Android phone.

## Project Structure

```
app/            — Screens (Expo Router file-based routing)
  (tabs)/       — Tab screens (Upcoming, Completed, Settings)
  task/         — Create and Edit task screens
  alarm.tsx     — Full-screen alarm UI
components/     — Reusable UI components
services/       — Database, alarm scheduler, repeat logic
hooks/          — Custom React hooks (useTasks, useSettings)
constants/      — Theme, types, sound configs
assets/         — Icons, splash screen, alarm sounds
```

## Android Permissions

The app uses these Android permissions:
- `SCHEDULE_EXACT_ALARM` — fire alarms at exact times
- `USE_FULL_SCREEN_INTENT` — show alarm over lock screen
- `RECEIVE_BOOT_COMPLETED` — re-schedule alarms after phone restart
- `FOREGROUND_SERVICE` — keep alarm sound playing
- `WAKE_LOCK` — wake the screen for alarms
- `VIBRATE` — vibration on alarm
- `POST_NOTIFICATIONS` — show notifications (Android 13+)
