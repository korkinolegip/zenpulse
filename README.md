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

### Проблемы, где ИИ ошибается чаще всего

**1. SafeArea — главная ловушка**
ИИ по умолчанию игнорирует «челку» и Home Indicator на iPhone. Генерирует `View` вместо `SafeAreaView`, и контент залезает под системные элементы. Контроль: в каждом промпте явно указывал «используй SafeAreaView из react-native-safe-area-context, а не из react-native».

**2. Фиксированные высоты вместо flexbox**
ИИ любит `height: 300` — на SE обрезается, на Pro Max появляются пустые поля. Контроль: прописал в системном промпте «никаких фиксированных высот, только flex, minHeight если нужно». Тернарный `isSmall` для критичных размеров.

**3. Отступы ScrollView**
ИИ забывает `paddingBottom: 40` в `contentContainerStyle` — кнопка «Попробовать бесплатно» уходит за нижний край экрана. Контроль: ревью каждого ScrollView на наличие bottomPadding.

**4. Тип данных для LinearGradient**
Expo Linear Gradient требует `readonly [string, string, ...string[]]`, ИИ передаёт `string[]` — TypeScript error в рантайме. Контроль: `as [string, string]` в constants/colors.ts + `npx tsc --noEmit` после каждого экрана.

**5. Размер текста на маленьких экранах**
ИИ ставит одинаковый `fontSize: 32` для заголовков — на SE заголовок занимает 2 строки и ломает layout. Контроль: `isSmall ? 26 : 32` для всех заголовков, `isSmall ? 14 : 16` для основного текста.

### Как контролировал

1. **`npx tsc --noEmit`** после каждого файла — ловит типовые ошибки до запуска
2. **Симулятор двух размеров** — проверка на iPhone SE (375pt) и iPhone 15 Pro Max (430pt)
3. **Системный контекст в промптах** — CLAUDE.md с правилами адаптивности читается при каждом запуске
4. **Явные ограничения** — список что НЕ делать (нет фиксированных высот, нет gesture-handler в layout, нет webpack-config)
