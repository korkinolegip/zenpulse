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
const CARD_WIDTH = width - (isSmall ? 32 : 40);
const CARD_IMAGE_HEIGHT = isSmall ? 140 : 160;

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
          <View style={styles.aiSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🤖</Text>
              <Text style={styles.sectionTitle}>AI Настрой дня</Text>
            </View>

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

            {affirmation && !loadingAI && (
              <View style={styles.affirmationCard}>
                <Text style={styles.affirmationQuote}>"</Text>
                <Text style={styles.affirmationText}>{affirmation}</Text>
                <Text style={styles.affirmationMeta}>AI · на основе твоего настроения</Text>
              </View>
            )}
          </View>

          {/* Meditations */}
          <View style={styles.meditationsSection}>
            <Text style={styles.sectionTitle}>Сессии медитаций</Text>

            {meditations.map((med) => {
              const locked = med.isPremium && !isSubscribed;
              return (
                <TouchableOpacity
                  key={med.id}
                  style={[styles.card, locked && styles.cardLocked]}
                  onPress={() => handleCardPress(med.isPremium)}
                  activeOpacity={locked ? 0.6 : 0.88}
                >
                  {/* Gradient image area */}
                  <LinearGradient
                    colors={med.gradient}
                    style={styles.cardImage}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.cardEmoji}>
                      {locked ? '🔒' : med.emoji}
                    </Text>
                    {locked && (
                      <View style={styles.lockOverlay}>
                        <Text style={styles.lockLabel}>Premium</Text>
                      </View>
                    )}
                    {!locked && (
                      <View style={styles.playOverlay}>
                        <Text style={styles.playIcon}>▶</Text>
                      </View>
                    )}
                  </LinearGradient>

                  {/* Info area */}
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, locked && styles.cardTitleLocked]} numberOfLines={1}>
                      {med.title}
                    </Text>
                    <View style={styles.cardMeta}>
                      <View style={[styles.categoryTag, locked && styles.categoryTagLocked]}>
                        <Text style={[styles.categoryText, locked && styles.categoryTextLocked]}>
                          {med.category}
                        </Text>
                      </View>
                      <Text style={[styles.durationText, locked && styles.durationLocked]}>
                        ⏱ {med.duration}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Upsell banner */}
          {!isSubscribed && (
            <TouchableOpacity
              onPress={() => router.push('/')}
              activeOpacity={0.85}
              style={styles.upsellBanner}
            >
              <LinearGradient
                colors={['rgba(155,89,182,0.35)', 'rgba(108,52,131,0.35)']}
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
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: {
    paddingHorizontal: isSmall ? 16 : 20,
    paddingBottom: 40,
  },
  header: {
    paddingTop: isSmall ? 20 : 28,
    paddingBottom: isSmall ? 16 : 20,
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

  // AI Section
  aiSection: {
    backgroundColor: Colors.whiteAlpha10,
    borderRadius: 20,
    padding: isSmall ? 14 : 18,
    marginBottom: isSmall ? 20 : 24,
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
  moodEmoji: { fontSize: isSmall ? 24 : 28, marginBottom: 4 },
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
  generateBtnDisabled: { opacity: 0.5 },
  generateText: {
    fontSize: isSmall ? 14 : 15,
    fontWeight: '700',
    color: Colors.white,
  },
  affirmationCard: {
    marginTop: 14,
    backgroundColor: Colors.whiteAlpha10,
    borderRadius: 14,
    padding: isSmall ? 14 : 16,
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

  // Meditation cards
  meditationsSection: {
    marginBottom: isSmall ? 16 : 20,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: isSmall ? 14 : 16,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha10,
  },
  cardLocked: {
    opacity: 0.45,
  },
  cardImage: {
    height: CARD_IMAGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardEmoji: {
    fontSize: isSmall ? 52 : 60,
  },
  lockOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  lockLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gold,
    letterSpacing: 0.5,
  },
  playOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 14,
    color: Colors.white,
    marginLeft: 2,
  },
  cardInfo: {
    paddingHorizontal: isSmall ? 14 : 16,
    paddingVertical: isSmall ? 12 : 14,
  },
  cardTitle: {
    fontSize: isSmall ? 16 : 18,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  cardTitleLocked: { color: Colors.whiteAlpha60 },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryTag: {
    backgroundColor: Colors.whiteAlpha20,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  categoryTagLocked: { backgroundColor: Colors.whiteAlpha10 },
  categoryText: {
    fontSize: 12,
    color: Colors.whiteAlpha80,
    fontWeight: '600',
  },
  categoryTextLocked: { color: Colors.whiteAlpha40 },
  durationText: {
    fontSize: 12,
    color: Colors.whiteAlpha60,
  },
  durationLocked: { color: Colors.whiteAlpha40 },

  // Upsell
  upsellBanner: {
    borderRadius: 16,
    overflow: 'hidden',
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
