import React, { useEffect, useState } from "react";
import { useNATS } from "@/contexts/NatsContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { NatsStyles } from "@/constants/NatsStyles";
import { Button } from "react-native";
import { ObjectStore, Objm } from "@nats-io/obj";

export default function Obj() {
  const { nc } = useNATS();
  const [obj, setObj] = useState<ObjectStore>();
  const [watching, setWatching] = useState(false);
  const [value, setValue] = useState<string>("waiting for value to change");

  useEffect(() => {
    if (nc && !obj) {
      (async () => {
        const objm = new Objm(nc);
        try {
          const o = await objm.create("my_react_obj_example");
          setObj(o);
        } catch (e) {
          console.log("error creating:", (e as Error).message);
        }
      })();
    }

    if (obj && !watching) {
      setWatching(true);
      (async () => {
        const iter = await obj.watch();
        (async () => {
          for await (const e of iter) {
            setValue(`'${e.name}' changed on ${e.mtime}`);
          }
        })().catch(() => {
          setWatching(false);
        });
      })();
    }
  }, [nc, obj]);

  function updateObj() {
    obj?.putBlob({ name: "entry" }, new TextEncoder().encode("Hello!")).catch();
  }

  if (!obj) {
    return (
      <ThemedView>
        <ThemedText type="subtitle">Obj</ThemedText>
        <ThemedText style={NatsStyles.lead}>Opening...</ThemedText>
      </ThemedView>
    );
  }
  return (
    <ThemedView>
      <ThemedText type="subtitle">Obj</ThemedText>
      <ThemedText style={NatsStyles.lead}>
        This section shows a simple component that watches an ObjectStore called
        'my_react_obj_example', and updates when any entry changes.
      </ThemedText>

      <ThemedText>The last change received:</ThemedText>
      <ThemedText style={NatsStyles.code}>{value}</ThemedText>

      <ThemedView style={{ marginTop: 20 }}>
        <Button title="Change Value" onPress={updateObj} />
      </ThemedView>
    </ThemedView>
  );
}
