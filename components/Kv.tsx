import React, { useEffect, useState } from "react";
import { useNATS } from "@/contexts/NatsContext";
import { KV, Kvm } from "@nats-io/kv";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { NatsStyles } from "@/constants/NatsStyles";
import { Button } from "react-native";

export default function Kv() {
  const { nc } = useNATS();
  const [kv, setKv] = useState<KV>();
  const [value, setValue] = useState<string>("waiting for value to change");
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    if (nc && !kv) {
      (async () => {
        const kvm = new Kvm(nc);
        try {
          const kv = await kvm.create("my_react_kv_example");
          setKv(kv);
        } catch (e) {
          console.log("error creating:", (e as Error).message);
        }
      })();
    }
    if (kv && !watching) {
      setWatching(true);
      (async () => {
        const iter = await kv.watch({ key: "key" });
        (async () => {
          for await (const e of iter) {
            if (e.operation === "DEL" || e.operation === "PURGE") {
              setValue("deleted");
            } else {
              setValue(e.string());
            }
          }
        })().catch(() => {
          setWatching(false);
        });
      })();
    }
  }, [nc, kv, watching]);

  function updateKv() {
    kv?.put("key", "Hello!    " + Date.now()).catch();
  }

  if (!kv) {
    return (
      <ThemedView style={{ marginBottom: 30 }}>
        <ThemedText type="subtitle">KV</ThemedText>
        <ThemedText style={NatsStyles.lead}>Opening...</ThemedText>
      </ThemedView>
    );
  }
  return (
    <ThemedView style={{ marginBottom: 30 }}>
      <ThemedText type="subtitle">KV</ThemedText>
      <ThemedText style={NatsStyles.lead}>
        This section shows a simple component that watches a KV for changes on
        the key 'key' that is stored in the bucket 'my_react_kv_example'. If the
        value changes, it will be reflected here:
      </ThemedText>

      <ThemedText>The current value of 'key' is:</ThemedText>
      <ThemedText style={NatsStyles.code}>{value}</ThemedText>

      <ThemedView style={{ marginTop: 20 }}>
        <Button title="Change Value" onPress={updateKv} />
      </ThemedView>
    </ThemedView>
  );
}
