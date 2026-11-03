import { use, useEffect, useState } from "react";
import {
  createInbox,
  type Msg,
  type QueuedIterator,
  type Status,
} from "@nats-io/nats-core";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { NatsStyles } from "@/constants/nats-styles";
import { Button } from "react-native";
import { natsConn, NATS_URL } from "@/lib/nats";

export type MsgEvent = {
  id: number;
  msg: Msg;
};

function Msgs({ msgs }: { msgs: MsgEvent[] }) {
  if (msgs.length === 0) return <ThemedView style={NatsStyles.codebox} />;
  return (
    <ThemedView style={NatsStyles.codebox}>
      {msgs.map((d) => (
        <ThemedText key={d.id} style={NatsStyles.code}>
          {d.id}&nbsp; {d.msg.subject}
        </ThemedText>
      ))}
    </ThemedView>
  );
}

export default function Nats() {
  const nc = use(natsConn());
  const [status, setStatus] = useState(`connected to ${nc.getServer()}`);
  const [messages, setMessages] = useState<MsgEvent[]>([]);
  const [err, setErr] = useState<Error | null>(null);
  const [inbox] = useState(() => {
    const i = createInbox("hello");
    return i.slice(0, i.length - 1);
  });

  useEffect(() => {
    let stopped = false;
    let id = 0;
    const statusIter = nc.status() as QueuedIterator<Status>;

    nc.closed().then(() => {
      if (!stopped) setStatus("NATS connection closed - reload the app");
    });

    (async () => {
      for await (const s of statusIter) {
        if (s.type === "disconnect") {
          setStatus(`disconnected from ${nc.getServer()}`);
        } else if (s.type === "reconnect") {
          setStatus(`connected to ${nc.getServer()}`);
        }
      }
    })().catch((err) => {
      console.error("status:", err);
    });

    const sub = nc.subscribe(inbox, {
      callback: (e, msg) => {
        if (e) {
          setErr(e);
          return;
        }
        const next = { id: ++id, msg };
        setMessages((prev) => [...prev, next].slice(-5));
      },
    });

    return () => {
      stopped = true;
      statusIter.stop();
      sub.unsubscribe();
    };
  }, [nc, inbox]);

  function pub() {
    nc.publish(inbox, "Hello from React Native");
  }

  return (
    <ThemedView style={{ marginBottom: 30 }}>
      <ThemedText style={NatsStyles.lead}>
        This is a trivial NATS React Native application that hints on how
        you can integrate a NATS connection into your app, based on the
        React Native generated example.
      </ThemedText>
      <ThemedText style={NatsStyles.p}>
        The connection is to {NATS_URL} with current status: {status}
      </ThemedText>

      <ThemedText style={NatsStyles.p}>
        The application is subscribed to &apos;{inbox}&apos; and receives all messages
        published to the server on that subject. The application prints the
        subject the message was received on. If nothing is printing, connect
        to the server at {NATS_URL} and publish a message with the &apos;nats&apos;
        CLI, or click the button below to publish a random message on
        &apos;{inbox}&apos;.
      </ThemedText>

      <Msgs msgs={messages} />
      <Button title="Publish Message" onPress={pub} />
      {err && <ThemedText type="subtitle">{err.message}</ThemedText>}
    </ThemedView>
  );
}
