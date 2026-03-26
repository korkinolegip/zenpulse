import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSubscription } from '@/context/SubscriptionContext';
import { meditations, getRandomAffirmation } from '@/data/meditations';
import { Colors } from '@/constants/colors';

const { width } = Dimensions.get('window');
const isSmall = width <= 375;

type Mood = 'happy' | 'neutral' | 'sad';

const moods: { key: Mood; emoji: string; label: string }[] = [
  { key: 'happy', emoji: '😊', label: 'Радость' },
  { key: 'neutral', emoji: '😐', label: 'Нейтрально' },
  { key: 'sad', emoji: '😔', label: 'Грусть' },
];

export default function HomeScreen() {
  const { isSubscribed } = useSubscription();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleGenerate = () => {
    if (!selectedMood) return;
    setLoadingAI(true);
    setAffirmation(null);
    setTimeout(() => {
      setAffirmation(getRandomAffirmation(selectedMood));
      setLoadingAI(false);
    }, 1500);
  };

  const handleCardPress = (isPremium: boolean) => {
    if (isPremium && !isSubscribed) {
      router.push('/');
    }
  };

  return (
    <LinearGradient colors={Colors.homeGradient} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Медитации</Text>
            <Text style={styles.subtitle}>Выбери практику для себя</Text>
          </View>

          {/* AI Mood Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🤖</Text>
              <Text style={styles.sectionTitle}>AI Настрой дня</Text>
            </View>

            {/* Mood Selector */}
            <View style={styles.moodRow}>
              {moods.map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[
                    styles.moodBtn,
                    selectedMood === m.key && styles.moodBtnSelected,
                  ]}
                  onPress={() => setSelectedMood(m.key)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={[
                    styles.moodLabel,
                    selectedMood === m.key && styles.moodLabelSelected,
                  ]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              onPress={handleGenerate}
              disabled={!selectedMood || loadingAI}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={selectedMood ? Colors.ctaGradient : ['#444', '#333']}
                style={[styles.generateBtn, !selectedMood && styles.generateBtnDisabled]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loadingAI ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.generateText}>
                    {affirmation ? '✨ Другая аффирмация' : '✨ Получить аффирмацию'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Affirmation Result */}
            {affirmation && !loadingAI && (
              <View style={styles.affirmationCard}>
                <Text style={styles.affirmationQuote}>"</Text>
                <Text style={styles.affirmationText}>{affirmation}</Text>
                <Text style={styles.affirmationMeta}>
                  AI · на основе твоего настроения
                </Text>
              </View>
            )}
          </View>

          {/* Meditations List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Сессии медитаций</Text>
            {meditations.map((med) => {
              const locked = med.isPremium && !isSubscribed;
              return (
                <TouchableOpacity
                  key={med.id}
                  style={[styles.meditationCard, locked && styles.meditationCardLocked]}
                  onPress={() => handleCardPress(med.isPremium)}
                  activeOpacity={locked ? 0.6 : 0.85}
                >
                  <View style={[styles.meditationEmoji, { backgroundColor: med.color }]}>
                    <Text style={styles.meditationEmojiText}>
                      {locked ? '🔒' : med.emoji}
                    </Text>
                  </View>
                  <View style={styles.meditationInfo}>
                    <Text style={[styles.meditationTitle, locked && styles.meditationTitleLocked]}>
                      {med.title}
                    </Text>
                    <View style={styles.meditationMeta}>
                      <View style={styles.categoryTag}>
                        <Text style={styles.categoryText}>{med.category}</Text>
                      </View>
                      <Text style={styles.durationText}>⏱ {med.duration}</Text>
                    </View>
                  </View>
                  {locked && (
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumText}>Premium</Text>
                    </View>
                  )}
                  {!locked && (
                    <Text style={styles.playIcon}>▶</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Upsell if not subscribed */}
          {!isSubscribed && (
            <TouchableOpacity
              style={styles.upsellBanner}
              onPress={() => router.push('/')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['rgba(155,89,182,0.3)', 'rgba(108,52,131,0.3)']}
                style={styles.upsellGradient}
              >
                <Text style={styles.upsellText}>
                  🔓 Разблокируй все медитации — 7 дней бесплатно
                </Text>
                <Text style={styles.upsellArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: isSmall ? 16 : 20,
    paddingBottom: 40,
  },
  header: {
    paddingTop: isSmall ? 20 : 28,
    paddingBottom: isSmall ? 16 : 24,
  },
  title: {
    fontSize: isSmall ? 28 : 34,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: isSmall ? 13 : 15,
    color: Colors.whiteAlpha60,
    marginTop: 4,
  },
  section: {
    marginBottom: isSmall ? 20 : 28,
    backgroundColor: Colors.whiteAlpha10,
    borderRadius: 20,
    padding: isSmall ? 14 : 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: isSmall ? 16 : 18,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 14,
  },
  moodRow: {
    flexDirection: 'row',
    gap: isSmall ? 8 : 10,
    marginBottom: 14,
  },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: isSmall ? 10 : 12,
    borderRadius: 12,
    backgroundColor: Colors.moodBg,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha20,
  },
  moodBtnSelected: {
    backgroundColor: Colors.moodBgSelected,
    borderColor: Colors.purple,
  },
  moodEmoji: {
    fontSize: isSmall ? 24 : 28,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: isSmall ? 10 : 11,
    color: Colors.whiteAlpha60,
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: Colors.purpleLight,
    fontWeight: '600',
  },
  generateBtn: {
    paddingVertical: isSmall ? 13 : 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  generateBtnDisabled: {
    opacity: 0.5,
  },
  generateText: {
    fontSize: isSmall ? 14 : 15,
    fontWeight: '700',
    color: Colors.white,
  },
  affirmationCard: {
    marginTop: 14,
    backgroundColor: Colors.whiteAlpha10,
    borderRadius: 14,
    padding: isSmall ? 14 : 18,
    borderLeftWidth: 3,
    borderLeftColor: Colors.purple,
  },
  affirmationQuote: {
    fontSize: 36,
    color: Colors.purple,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 4,
  },
  affirmationText: {
    fontSize: isSmall ? 14 : 15,
    color: Colors.whiteAlpha80,
    lineHeight: isSmall ? 22 : 24,
    fontStyle: 'italic',
  },
  affirmationMeta: {
    marginTop: 10,
    fontSize: 11,
    color: Colors.whiteAlpha40,
  },
  meditationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: isSmall ? 12 : 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  meditationCardLocked: {
    opacity: 0.45,
  },
  meditationEmoji: {
    width: isSmall ? 48 : 54,
    height: isSmall ? 48 : 54,
    borderRadius: isSmall ? 12 : 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  meditationEmojiText: {
    fontSize: isSmall ? 22 : 26,
  },
  meditationInfo: {
    flex: 1,
  },
  meditationTitle: {
    fontSize: isSmall ? 14 : 16,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 6,
  },
  meditationTitleLocked: {
    color: Colors.whiteAlpha60,
  },
  meditationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: Colors.whiteAlpha20,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: 11,
    color: Colors.whiteAlpha80,
    fontWeight: '600',
  },
  durationText: {
    fontSize: 12,
    color: Colors.whiteAlpha60,
  },
  premiumBadge: {
    backgroundColor: Colors.gold,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1a0533',
  },
  playIcon: {
    fontSize: 16,
    color: Colors.purpleLight,
    paddingLeft: 8,
  },
  upsellBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  upsellGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isSmall ? 14 : 16,
    borderWidth: 1,
    borderColor: Colors.cardBorderPurple,
    borderRadius: 16,
  },
  upsellText: {
    flex: 1,
    fontSize: isSmall ? 13 : 14,
    color: Colors.white,
    fontWeight: '600',
  },
  upsellArrow: {
    fontSize: 18,
    color: Colors.purpleLight,
    marginLeft: 8,
  },
});
