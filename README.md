# ZenPulse: AI Meditation App

Прототип мобильного приложения для медитаций с AI-персонализацией. Тестовое задание Vibe-Coding.

## Стек
- **React Native** 0.81.5 + **Expo SDK 54**
- **expo-router** — файловая навигация
- **expo-linear-gradient** — premium UI
- **React Context** — состояние подписки
- **TypeScript** — строгая типизация

## Запуск

```bash
# Клонировать репо
git clone https://github.com/korkinolegip/zenpulse.git
cd zenpulse

# Установить зависимости
npm install

# Выбрать Xcode
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer

# Запустить (для Expo Go на iPhone — через туннель)
npx expo start --tunnel

# Или для симулятора
npx expo start
```

Сканировать QR-код через **Expo Go** (iOS, SDK 54.0.0).

## Экраны

### 1. Paywall (Экран подписки)
- Тёмный градиент `#1a0533 → #2d1b69 → #0f3460` — медитативный, «дорогой» дизайн
- 4 преимущества Premium с иконками
- Два тарифа: Monthly ($9.99) / Annual ($59.99) — Annual выделен золотым border + badge «ВЫГОДНЕЕ»
- Кнопка «Попробовать бесплатно 7 дней» → 1.5с имитация загрузки → переход на Home

### 2. Home / Медитации
- 6 медитационных карточек: первые 3 доступны, последние 3 — заблокированы (opacity 0.4 + 🔒 + badge «Premium»)
- Тап на заблокированную карточку → возврат на Paywall
- Баннер «Разблокируй все медитации» для неподписанных

### 3. AI Настрой дня
- 3 эмодзи-кнопки выбора настроения: 😊 Радость / 😐 Нейтрально / 😔 Грусть
- Кнопка активна только после выбора настроения
- 1.5с имитация генерации → случайная аффирмация из 9 подготовленных вариантов

## Архитектура

```
app/
  _layout.tsx          → Stack navigator, SubscriptionProvider
  index.tsx            → PaywallScreen
  home.tsx             → HomeScreen + AI Mood
context/
  SubscriptionContext.tsx → isSubscribed, activateTrial
data/
  meditations.ts       → 6 сессий + AI mock responses
constants/
  colors.ts            → цветовая система
```

## Логика isSubscribed

```typescript
// context/SubscriptionContext.tsx
const [isSubscribed, setIsSubscribed] = useState(false);
const activateTrial = () => setIsSubscribed(true);

// app/home.tsx — блокировка карточек
const locked = med.isPremium && !isSubscribed;
// locked → opacity 0.4 + 🔒 + тап → router.push('/')
```

## Адаптивность: iPhone SE vs Pro Max

```typescript
const { width } = Dimensions.get('window');
const isSmall = width <= 375; // iPhone SE = 375pt

// Все размеры через тернарный оператор:
fontSize: isSmall ? 26 : 32,
padding: isSmall ? 16 : 24,
// Нет фиксированных высот — только flexbox
```

---

## Контрольный вопрос

**«С какими специфическими проблемами мобильной верстки ИИ справляется хуже всего и как ты контролировал его работу, чтобы приложение не сломалось на маленьких экранах (iPhone SE vs Pro Max)?»**

Отвечаю честно — на основе конкретных проблем, которые возникли в этой сессии, а не теоретических примеров.

---

### Проблема 1: SafeArea + `position: absolute` — невидимый конфликт

ИИ поместил кнопку «Пропустить» через `position: absolute, top: 12, right: 20` внутри `<SafeAreaView>`. Логика казалась правильной: SafeAreaView добавляет отступы → элемент внутри должен быть ниже статус-бара.

**Реальность**: `position: absolute` полностью игнорирует `padding` родителя. Кнопка оказалась в зоне status bar — поверх иконок батареи и WiFi на iPhone 17 Pro.

**Решение**: `useSafeAreaInsets()` из `react-native-safe-area-context` — получаем числовое значение `insets.top` и применяем его напрямую к стилю:
```typescript
style={{ top: insets.top + 8 }}
```

**Урок**: ИИ знает что такое SafeAreaView, но не моделирует взаимодействие `position: absolute` с системой insets. Любой абсолютно-позиционированный элемент у системных краёв — обязательная ручная проверка.

---

### Проблема 2: ИИ не знает UX-паттернов — знает только вёрстку

Кнопка «Продолжить без подписки» была добавлена в топ-правый угол — классическая позиция Close (✕) для модальных экранов. Технически верно. UX — провал: в paywall это зона системных иконок, и кнопка «выхода» должна быть максимально незаметной, а не соперничать с CTA.

Вторая итерация: добавил `borderTopWidth: 1` и `textDecorationLine: 'underline'` — кнопка стала слишком заметной и визуально «давила» на пользователя.

**Решение**: fixed footer вне ScrollView, без разделителя, `color: rgba(255,255,255,0.2)`, без underline. Паттерн Calm / Headspace / Duolingo — secondary action не должен конкурировать с primary CTA.

**Урок**: ИИ отлично верстает компоненты, но не понимает иерархию внимания пользователя. UX-решения (где разместить skip, насколько он заметен) — всегда требуют ревью человека.

---

### Проблема 3: Версии пакетов и несовместимость SDK

ИИ написал `package.json` с `expo-router: "~4.0.0"` и `expo-linear-gradient: "~14.0.0"`. После `npm install` выяснилось что реально установленный `expo@54.0.33` требует `expo-router@~6.0.23` и `expo-linear-gradient@~15.0.8`.

Приложение падало с `babel-preset-expo: Cannot find module` — потому что после `expo install --fix` пакеты обновились, но Metro bundler держал старый кэш.

**Решение**: `npx expo start --clear` — сброс кэша Metro + правильные версии.

**Урок**: ИИ обучен на данных с отставанием. Для Expo SDK 54 версии пакетов нужно проверять через `npx expo install --fix`, а не доверять ИИ-сгенерированному `package.json`.

---

### Проблема 4: `string[]` вместо tuple для LinearGradient

Expo LinearGradient ожидает `readonly [string, string, ...string[]]`, ИИ передавал `string[]`. TypeScript молчал на уровне компонента, но ломался при компиляции строгого `tsc`.

**Решение**: `as [string, string]` и `as [string, string, string]` в `constants/colors.ts`. Вынес все градиенты в константы с правильными типами — один раз, всё приложение работает.

---

### Как контролировал: конкретные инструменты

| Инструмент | Когда применял | Что ловил |
|-----------|----------------|-----------|
| `npx tsc --noEmit` | После каждого нового файла | Типовые ошибки LinearGradient, неверные пропсы |
| `npx expo start --clear` | При странных ошибках Metro | Кэш bundler, устаревшие модули |
| `npx expo install --fix` | После обновления SDK | Несовместимые версии пакетов |
| `useSafeAreaInsets()` | Для absolute-positioned UI | Конфликт с status bar |
| Симулятор iPhone 17 Pro | Финальная проверка экранов | Реальное отображение всего флоу |

### SE vs Pro Max: конкретные правила

```typescript
const { width } = Dimensions.get('window');
const isSmall = width <= 375; // SE = 375pt, Pro Max = 430pt

// Правило: никаких магических чисел
fontSize: isSmall ? 26 : 32,       // заголовок
fontSize: isSmall ? 13 : 15,       // основной текст
padding: isSmall ? 14 : 18,        // внутренние отступы карточек
CARD_IMAGE_HEIGHT: isSmall ? 140 : 160,  // высота gradient-картинки
```

Нет ни одного `height: 300` в коде. Все высоты — flex или minHeight. Это единственный способ гарантировать что SE не обрежет контент а Pro Max не растянет его в пустоту.
