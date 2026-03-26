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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSubscription } from '@/context/SubscriptionContext';
import { Colors } from '@/constants/colors';

const { width } = Dimensions.get('window');
const isSmall = width <= 375;

const benefits = [
  { icon: '✨', text: '100+ медитаций для любого настроения' },
  { icon: '🤖', text: 'AI настрой дня — персональные аффирмации' },
  { icon: '😴', text: 'Сессии для сна, фокуса и снятия стресса' },
  { icon: '📊', text: 'Прогресс и статистика практик' },
];

const plans = {
  monthly: { label: 'Monthly', price: '$9.99', period: 'в месяц', badge: null },
  annual: { label: 'Annual', price: '$59.99', period: 'в год · ~$5/мес', badge: 'ВЫГОДНЕЕ' },
};

export default function PaywallScreen() {
  const { selectedPlan, setSelectedPlan, activateTrial } = useSubscription();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleTrial = () => {
    setLoading(true);
    setTimeout(() => {
      activateTrial();
      router.replace('/home');
    }, 1500);
  };

  return (
    <LinearGradient colors={Colors.paywallGradient} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🧘</Text>
            <Text style={styles.title}>ZenPulse Premium</Text>
            <Text style={styles.subtitle}>Найди покой внутри себя</Text>
          </View>

          {/* Benefits */}
          <View style={styles.benefits}>
            {benefits.map((b, i) => (
              <View key={i} style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>{b.icon}</Text>
                <Text style={styles.benefitText}>{b.text}</Text>
              </View>
            ))}
          </View>

          {/* Plans */}
          <View style={styles.plans}>
            {(Object.keys(plans) as Array<keyof typeof plans>).map((key) => {
              const plan = plans[key];
              const isSelected = selectedPlan === key;
              const isAnnual = key === 'annual';
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.planCard,
                    isSelected && isAnnual && styles.planCardGold,
                    isSelected && !isAnnual && styles.planCardPurple,
                  ]}
                  onPress={() => setSelectedPlan(key)}
                  activeOpacity={0.8}
                >
                  <View style={styles.planLeft}>
                    <Text style={styles.planLabel}>{plan.label}</Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  </View>
                  <View style={styles.planRight}>
                    {plan.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{plan.badge}</Text>
                      </View>
                    )}
                    <Text style={[styles.planPrice, isAnnual && isSelected && styles.planPriceGold]}>
                      {plan.price}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={[styles.checkmark, isAnnual && styles.checkmarkGold]}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* CTA */}
          <View style={styles.cta}>
            <TouchableOpacity
              onPress={handleTrial}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={Colors.ctaGradientGold}
                style={styles.ctaButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#1a0533" size="small" />
                ) : (
                  <Text style={styles.ctaText}>Попробовать бесплатно 7 дней</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.disclaimer}>
              Отмена в любой момент · Автопродление после триала
            </Text>
          </View>
        </ScrollView>

        {/* Fixed footer — паттерн Calm/Headspace: всегда видна, вне ScrollView */}
        <TouchableOpacity
          onPress={() => router.replace('/home')}
          style={styles.skipFooter}
          activeOpacity={0.7}
        >
          <Text style={styles.skipFooterText}>Продолжить без подписки</Text>
        </TouchableOpacity>
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
    paddingHorizontal: isSmall ? 16 : 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: isSmall ? 24 : 40,
    paddingBottom: isSmall ? 24 : 32,
  },
  logo: {
    fontSize: isSmall ? 52 : 64,
    marginBottom: 12,
  },
  title: {
    fontSize: isSmall ? 26 : 32,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: isSmall ? 14 : 16,
    color: Colors.whiteAlpha60,
    marginTop: 8,
    textAlign: 'center',
  },
  benefits: {
    marginBottom: isSmall ? 20 : 28,
    backgroundColor: Colors.whiteAlpha10,
    borderRadius: 16,
    padding: isSmall ? 12 : 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isSmall ? 8 : 10,
  },
  benefitIcon: {
    fontSize: 20,
    width: 32,
  },
  benefitText: {
    flex: 1,
    fontSize: isSmall ? 14 : 15,
    color: Colors.whiteAlpha80,
    lineHeight: 20,
  },
  plans: {
    gap: 12,
    marginBottom: isSmall ? 24 : 32,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: isSmall ? 14 : 18,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    position: 'relative',
  },
  planCardGold: {
    backgroundColor: Colors.cardBgSelected,
    borderColor: Colors.gold,
  },
  planCardPurple: {
    borderColor: Colors.cardBorderPurple,
  },
  planLeft: {
    flex: 1,
  },
  planLabel: {
    fontSize: isSmall ? 15 : 17,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  planPeriod: {
    fontSize: isSmall ? 12 : 13,
    color: Colors.whiteAlpha60,
  },
  planRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  badge: {
    backgroundColor: Colors.gold,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1a0533',
  },
  planPrice: {
    fontSize: isSmall ? 16 : 18,
    fontWeight: '800',
    color: Colors.white,
  },
  planPriceGold: {
    color: Colors.gold,
  },
  checkmark: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkGold: {
    backgroundColor: Colors.gold,
  },
  checkmarkText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1a0533',
  },
  cta: {
    alignItems: 'center',
    gap: 12,
  },
  ctaButton: {
    paddingVertical: isSmall ? 16 : 18,
    paddingHorizontal: isSmall ? 32 : 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: width - (isSmall ? 32 : 48),
    minHeight: 56,
  },
  ctaText: {
    fontSize: isSmall ? 15 : 17,
    fontWeight: '800',
    color: '#1a0533',
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.whiteAlpha40,
    textAlign: 'center',
    lineHeight: 18,
  },
  skipFooter: {
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.whiteAlpha10,
  },
  skipFooterText: {
    fontSize: 13,
    color: Colors.whiteAlpha40,
    textDecorationLine: 'underline',
    textDecorationColor: Colors.whiteAlpha40,
  },
});
