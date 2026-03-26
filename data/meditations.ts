export type Meditation = {
  id: string;
  title: string;
  duration: string;
  category: string;
  emoji: string;
  color: string;
  isPremium: boolean;
};

export const meditations: Meditation[] = [
  {
    id: 'med-001',
    title: 'Утренняя тишина',
    duration: '10 мин',
    category: 'Фокус',
    emoji: '🌅',
    color: '#1a1a2e',
    isPremium: false,
  },
  {
    id: 'med-002',
    title: 'Снятие стресса',
    duration: '15 мин',
    category: 'Стресс',
    emoji: '🌊',
    color: '#16213e',
    isPremium: false,
  },
  {
    id: 'med-003',
    title: 'Глубокий сон',
    duration: '20 мин',
    category: 'Сон',
    emoji: '🌙',
    color: '#0f3460',
    isPremium: false,
  },
  {
    id: 'med-004',
    title: 'Энергия дня',
    duration: '8 мин',
    category: 'Энергия',
    emoji: '⚡',
    color: '#533483',
    isPremium: true,
  },
  {
    id: 'med-005',
    title: 'Благодарность',
    duration: '12 мин',
    category: 'Фокус',
    emoji: '✨',
    color: '#2d132c',
    isPremium: true,
  },
  {
    id: 'med-006',
    title: 'Тело и разум',
    duration: '25 мин',
    category: 'Баланс',
    emoji: '🧘',
    color: '#1b262c',
    isPremium: true,
  },
];

// Mock LLM responses (промпт: "Generate a short 2-sentence meditation affirmation for someone feeling {mood}. Be warm, specific, and grounding.")
export const aiResponses = {
  happy: [
    'Твоя радость — это маяк для тех, кто рядом. Позволь этому свету наполнить каждую клетку твоего тела.',
    'Сегодня ты в гармонии с собой и миром. Сохрани это ощущение — оно всегда с тобой.',
    'Улыбка — самая короткая медитация. Ты уже практикуешь прямо сейчас.',
  ],
  neutral: [
    'Нейтральность — это не пустота, это чистый лист. Сегодня ты можешь написать на нём что угодно.',
    'Спокойствие — твоя суперсила. Из этого состояния рождаются лучшие решения.',
    'Ты в балансе. Просто дыши — вдох на 4 счёта, выдох на 6.',
  ],
  sad: [
    'Грусть — это тоже часть тебя, и она заслуживает принятия. Положи руку на сердце и скажи: «Я здесь».',
    'Слёзы очищают. После дождя воздух становится чище — так же и с тобой.',
    'Этот момент пройдёт. А пока — просто позволь себе быть таким, какой ты есть сейчас.',
  ],
};

export function getRandomAffirmation(mood: keyof typeof aiResponses): string {
  const list = aiResponses[mood];
  return list[Math.floor(Math.random() * list.length)];
}
