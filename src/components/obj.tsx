import { use, useEffect, useState } from "react";
import type { QueuedIterator } from "@nats-io/nats-core";
import type { ObjectInfo } from "@nats-io/obj";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { NatsStyles } from "@/constants/nats-styles";
import { Button } from "react-native";
import { natsObj } from "@/lib/nats";

export default function Obj() {
  const obj = use(natsObj());
  const [value, setValue] = useState<string>("waiting for value to change");

  useEffect(() => {
    let iter: QueuedIterator<ObjectInfo | null> | undefined;
    (async () => {
      iter = await obj.watch();
      for await (const e of iter) {
        if (e) setValue(`'${e.name}' changed on ${e.mtime}`);
      }
    })().catch((err) => {
      console.error("obj watch:", err);
    });
    return () => {
      iter?.stop();
    };
  }, [obj]);

  function updateObj() {
    obj.putBlob({ name: "entry" }, new TextEncoder().encode("Hello!"))
      .catch(console.error);
  }

  return (
    <ThemedView>
      <ThemedText type="subtitle">Obj</ThemedText>
      <ThemedText style={NatsStyles.lead}>
        This section shows a simple component that watches an ObjectStore
        called &apos;my_react_obj_example&apos;, and updates when any entry changes.
      </ThemedText>

      <ThemedText>The last change received:</ThemedText>
      <ThemedText style={NatsStyles.code}>{value}</ThemedText>

      <ThemedView style={{ marginTop: 20 }}>
        <Button title="Change Value" onPress={updateObj} />
      </ThemedView>
    </ThemedView>
  );
}
