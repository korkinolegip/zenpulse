# SPEC.md — ZenPulse Technical Specification

---

## Модуль 1: Subscription State (Context)

### User Stories
- Как пользователь, я хочу видеть Paywall при первом открытии, чтобы узнать о Premium
- Как пользователь, я хочу нажать "Попробовать бесплатно" и сразу попасть в контент
- Как пользователь, я хочу чтобы при повторном открытии приложения мой статус сохранялся (AsyncStorage)

### Модель данных
```
SubscriptionContext:
  isSubscribed: boolean (default: false)
  selectedPlan: 'monthly' | 'annual' | null (default: null)
  activateTrial: () => void  // устанавливает isSubscribed = true
  plan: { monthly: { price: '$9.99', label: 'Monthly' }, annual: { price: '$59.99', label: 'Annual', badge: 'BEST VALUE' } }
```

### Бизнес-логика
- `activateTrial()`: isSubscribed = true, сохранить в AsyncStorage
- При mount Context: читать AsyncStorage → восстанавливать isSubscribed
- isSubscribed = false → карточки с индексом >= 3 заблокированы

### Крайние случаи
- AsyncStorage недоступен → работать только в памяти, не крашить
- activateTrial вызван дважды → idempotent, isSubscribed остаётся true

---

## Модуль 2: Paywall Screen

### User Stories
- Как потенциальный платящий пользователь, я хочу видеть красивый экран с преимуществами
- Как пользователь, я хочу выбрать тариф Monthly или Annual с визуальным различием
- Как пользователь, я хочу нажать "Попробовать бесплатно" и перейти на Home

### Экраны и компоненты
```
PaywallScreen
  ├── SafeAreaView (flex: 1, backgroundColor: gradient start)
  ├── LinearGradient (colors: ['#1a0533', '#2d1b69', '#0f3460'])
  ├── ScrollView (showsVerticalScrollIndicator: false)
  │   ├── Header
  │   │   ├── Logo / Icon (🧘)
  │   │   ├── Title: "ZenPulse Premium"
  │   │   └── Subtitle: "Найди покой внутри себя"
  │   ├── BenefitsList
  │   │   ├── BenefitItem: ✨ "100+ медитаций для любого настроения"
  │   │   ├── BenefitItem: 🤖 "AI настрой дня — персональные аффирмации"
  │   │   ├── BenefitItem: 😴 "Сессии для сна, фокуса и снятия стресса"
  │   │   └── BenefitItem: 📊 "Прогресс и статистика практик"
  │   ├── PlanSelector
  │   │   ├── PlanCard (monthly): "$9.99/месяц", border: purple
  │   │   └── PlanCard (annual): "$59.99/год · ~$5/мес", badge: "ВЫГОДНЕЕ", border: gold, highlighted
  │   └── CTASection
  │       ├── TrialButton: "Попробовать бесплатно 7 дней"
  │       └── Disclaimer: "Отмена в любой момент · Автопродление после триала"
```

**Состояния:**
- `loading`: кнопка disabled + ActivityIndicator (1.5с имитация)
- `success`: navigate to Home
- `selectedPlan`: 'annual' (default, выделен)

### API / Actions
```
onPressTrial() → setLoading(true) → setTimeout 1500ms → activateTrial() → router.replace('/home')
onSelectPlan(plan: 'monthly' | 'annual') → setSelectedPlan(plan)
```

### Бизнес-логика
- Annual выбран по умолчанию (визуально highlighted: golden border + badge)
- Monthly: обычная карточка с purple border
- Кнопка всегда активна (не зависит от выбранного плана)
- Gradient: тёмно-фиолетовый → тёмно-синий (медитативный)

### Крайние случаи
- Маленький экран (iPhone SE, 375pt): ScrollView с padding, текст не обрезан
- Большой экран (Pro Max, 430pt): контент центрирован, не растянут

---

## Модуль 3: Home / Meditations Screen

### User Stories
- Как подписанный пользователь, я хочу видеть все медитации доступными
- Как неподписанный пользователь, я хочу видеть первые 3 сессии, остальные — с замком
- Как пользователь, я хочу нажать на заблокированную карточку и попасть на Paywall
- Как пользователь, я хочу выбрать настроение и получить AI аффирмацию

### Экраны и компоненты
```
HomeScreen
  ├── SafeAreaView
  ├── LinearGradient (colors: ['#0f0c29', '#302b63', '#24243e'])
  ├── ScrollView
  │   ├── Header
  │   │   ├── Title: "Медитации"
  │   │   └── Subtitle: "Выбери практику для себя"
  │   ├── AIMoodSection
  │   │   ├── SectionTitle: "AI Настрой дня"
  │   │   ├── MoodSelector (3 кнопки)
  │   │   │   ├── MoodButton: 😊 "Радость"
  │   │   │   ├── MoodButton: 😐 "Нейтрально"
  │   │   │   └── MoodButton: 😔 "Грусть"
  │   │   ├── GenerateButton: "Получить аффирмацию"
  │   │   └── AffirmationCard (visible after generation)
  │   │       ├── AffirmationText: "..."
  │   │       └── RegenerateButton: "Другая"
  │   └── MeditationsList
  │       └── MeditationCard × 6
  │           ├── (free: 0-2) ImageBackground + Title + Duration + CategoryTag
  │           └── (locked: 3-5) opacity: 0.4 + LockIcon + "Premium"
```

**Состояния AIMoodSection:**
- `idle`: только MoodSelector + GenerateButton (disabled без выбора мода)
- `loading`: GenerateButton → spinner (1.5с)
- `success`: AffirmationCard появляется с fade animation
- `error`: "Попробуйте позже" (не должно возникать при mock)

### Модель данных медитаций
```typescript
type Meditation = {
  id: string          // uuid-like: 'med-001'
  title: string       // "Утренняя тишина"
  duration: string    // "10 мин"
  category: string    // "Фокус" | "Сон" | "Стресс" | "Энергия"
  emoji: string       // "🌅" | "🌙" | "🌊" | "⚡"
  color: string       // градиент карточки '#1a1a2e'
  isPremium: boolean  // первые 3: false, остальные: true
}
```

### AI Mock Data
```typescript
// Промпт к LLM (для README):
// "Generate a short 2-sentence meditation affirmation for someone feeling {mood}.
//  Be warm, specific, and grounding."

// Mock responses по настроению:
happy: [
  "Твоя радость — это маяк для тех, кто рядом. Позволь этому свету наполнить каждую клетку твоего тела.",
  "Сегодня ты в гармонии с собой и миром. Сохрани это ощущение — оно всегда с тобой.",
  "Улыбка — самая короткая медитация. Ты уже практикуешь прямо сейчас."
]
neutral: [
  "Нейтральность — это не пустота, это чистый лист. Сегодня ты можешь написать на нём что угодно.",
  "Спокойствие — твоя суперсила. Из этого состояния рождаются лучшие решения.",
  "Ты в балансе. Просто дыши — вдох на 4 счёта, выдох на 6."
]
sad: [
  "Грусть — это тоже часть тебя, и она заслуживает принятия. Положи руку на сердце и скажи: 'Я здесь'.",
  "Слёзы очищают. После дождя воздух становится чище — так же и с тобой.",
  "Этот момент пройдёт. А пока — просто позволь себе быть таким, какой ты есть сейчас."
]
```

### API / Actions
```
onSelectMood(mood: 'happy' | 'neutral' | 'sad') → setSelectedMood(mood)
onGenerateAffirmation() → setLoading(true) → setTimeout 1500ms → pickRandom(mockResponses[mood]) → setAffirmation(text)
onPressLockedCard() → router.push('/') [возврат на Paywall]
```

### Бизнес-логика
- Первые 3 медитации (isPremium: false): всегда доступны, полная непрозрачность
- Медитации 4-6 (isPremium: true): если !isSubscribed → opacity 0.4, overlay с замком
- GenerateButton disabled если selectedMood === null
- Каждый вызов генерации — случайный выбор из 3 вариантов для мода

### Крайние случаи
- Нет выбранного настроения → кнопка задизаблена, тап → не генерировать
- Повторный тап "Другая" → новый случайный ответ (не тот же)
- Пользователь подписан → все 6 карточек кликабельны (навигация на детальный экран — TODO v2)

---

## Модуль 4: Navigation

### Структура (expo-router)
```
app/
  _layout.tsx     → Stack navigator, headerShown: false
  index.tsx       → PaywallScreen (если !isSubscribed) или redirect to /home
  home.tsx        → HomeScreen
```

### Правила навигации
- Старт приложения: index.tsx читает isSubscribed из Context
- isSubscribed = false → показывает Paywall
- isSubscribed = true → router.replace('/home')
- После activateTrial → router.replace('/home') [нельзя назад на Paywall через жест]
- Locked card tapped → router.push('/') [можно вернуться с Home]

---

## Модуль 5: Responsive Layout

### Правила адаптивности
```typescript
const { width, height } = Dimensions.get('window')
const isSmallScreen = width <= 375  // iPhone SE
const isTallScreen = height >= 844  // iPhone 14+
```

### Breakpoints
| Элемент | iPhone SE (375) | iPhone 14 (390) | Pro Max (430) |
|---------|----------------|-----------------|---------------|
| PlanCard высота | 80 | 90 | 100 |
| Header fontSize | 28 | 32 | 36 |
| Card padding | 12 | 16 | 20 |
| BenefitItem fontSize | 14 | 16 | 16 |

### SafeArea
- Все экраны: `SafeAreaView` из `react-native-safe-area-context`
- ScrollView: `contentContainerStyle` с `paddingBottom: 40` (кнопки не обрезаются)
- `KeyboardAvoidingView` не нужен (нет text inputs)
