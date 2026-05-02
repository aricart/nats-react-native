import { Image, StyleSheet } from "react-native";
import { Suspense } from "react";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Nats from "@/components/Nats";
import Kv from "@/components/Kv";
import Obj from "@/components/Obj";
import { NatsStyles } from "@/constants/NatsStyles";
import { natsConn, natsKv, natsObj } from "@/lib/nats";

export default function HomeScreen() {
  // prime all three resources so Suspense doesn't waterfall their fetches.
  natsConn();
  natsKv();
  natsObj();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/nats.png")}
          style={NatsStyles.logo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView>
        <ErrorBoundary
          fallback={(err) => (
            <ThemedView>
              <ThemedText type="subtitle">
                Error Connecting to NATS
              </ThemedText>
              <ThemedText>{err.message}</ThemedText>
            </ThemedView>
          )}
        >
          <Suspense
            fallback={
              <ThemedView>
                <ThemedText type="subtitle">Connecting to NATS...</ThemedText>
              </ThemedView>
            }
          >
            <Nats />
            <Kv />
            <Obj />
          </Suspense>
        </ErrorBoundary>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
