# CLAUDE.md — ZenPulse Agent Config

## Проект
ZenPulse: AI Meditation App — прототип для тестового задания.
3 экрана: Paywall → Home (медитации + AI настрой дня).
Репо: github.com/korkinolegip/zenpulse

## Стек
- Expo SDK 54, React 19.1.0, React Native 0.81.5
- expo-router (навигация), expo-linear-gradient (UI)
- React Context (isSubscribed state)
- TypeScript, StyleSheet API

## Критические ограничения (не нарушать)
- `newArchEnabled: false` в app.json — ОБЯЗАТЕЛЬНО
- НЕ импортировать react-native-gesture-handler в App.tsx или _layout.tsx
- НЕ добавлять @expo/webpack-config
- Перед запуском: `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`
- Expo Go SDK 54.0.0 на iPhone — единственная тест-среда

## Архитектура
```
app/_layout.tsx          → Stack (headerShown: false)
app/index.tsx            → PaywallScreen
app/home.tsx             → HomeScreen
context/SubscriptionContext.tsx → isSubscribed, activateTrial
data/meditations.ts      → 6 сессий + AI mock responses
constants/colors.ts      → цветовая система
```

## Правила
- Адаптивность: Dimensions.get('window'), flexbox, без фиксированных высот
- SafeArea: react-native-safe-area-context на каждом экране
- Блокировка: isPremium && !isSubscribed → opacity 0.4 + замок + tap → router.push('/')
- AI mock: setTimeout 1500ms + random pick из 3 вариантов по настроению

## Команды
```bash
cd /Users/olegkorkin/Downloads/claude/ZenPulse
npx expo start --tunnel   # для Expo Go на iPhone
npx expo start            # для симулятора
```
