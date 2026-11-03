import { use, useEffect, useState } from "react";
import type { QueuedIterator } from "@nats-io/nats-core";
import type { KvWatchEntry } from "@nats-io/kv";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { NatsStyles } from "@/constants/nats-styles";
import { Button } from "react-native";
import { natsKv } from "@/lib/nats";

export default function Kv() {
  const kv = use(natsKv());
  const [value, setValue] = useState<string>("waiting for value to change");

  useEffect(() => {
    let iter: QueuedIterator<KvWatchEntry> | undefined;
    (async () => {
      iter = await kv.watch({ key: "key" });
      for await (const e of iter) {
        if (e.operation === "DEL" || e.operation === "PURGE") {
          setValue("deleted");
        } else {
          setValue(e.string());
        }
      }
    })().catch((err) => {
      console.error("kv watch:", err);
    });
    return () => {
      iter?.stop();
    };
  }, [kv]);

  function updateKv() {
    kv.put("key", "Hello!    " + Date.now()).catch(console.error);
  }

  return (
    <ThemedView style={{ marginBottom: 30 }}>
      <ThemedText type="subtitle">KV</ThemedText>
      <ThemedText style={NatsStyles.lead}>
        This section shows a simple component that watches a KV for changes
        on the key &apos;key&apos; that is stored in the bucket &apos;my_react_kv_example&apos;.
        If the value changes, it will be reflected here:
      </ThemedText>

      <ThemedText>The current value of &apos;key&apos; is:</ThemedText>
      <ThemedText style={NatsStyles.code}>{value}</ThemedText>

      <ThemedView style={{ marginTop: 20 }}>
        <Button title="Change Value" onPress={updateKv} />
      </ThemedView>
    </ThemedView>
  );
}
