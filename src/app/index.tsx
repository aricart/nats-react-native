import { Suspense } from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/error-boundary';
import Kv from '@/components/kv';
import Nats from '@/components/nats';
import Obj from '@/components/obj';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { NatsStyles } from '@/constants/nats-styles';
import { natsConn, natsKv, natsObj } from '@/lib/nats';

export default function HomeScreen() {
  // prime all three resources so Suspense doesn't waterfall their fetches.
  natsConn();
  natsKv();
  natsObj();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedView style={styles.heroSection}>
            <Image source={require('@/assets/images/nats.png')} style={NatsStyles.logo} />
            <ThemedText type="title" style={styles.title}>
              Welcome!
            </ThemedText>
          </ThemedView>

          <ErrorBoundary
            fallback={(err) => (
              <ThemedView>
                <ThemedText type="subtitle">Error Connecting to NATS</ThemedText>
                <ThemedText>{err.message}</ThemedText>
              </ThemedView>
            )}>
            <Suspense
              fallback={
                <ThemedView>
                  <ThemedText type="subtitle">Connecting to NATS...</ThemedText>
                </ThemedView>
              }>
              <Nats />
              <Kv />
              <Obj />
            </Suspense>
          </ErrorBoundary>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
});
