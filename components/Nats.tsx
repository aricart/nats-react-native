import React, { useEffect, useState } from "react";
import { useNATS } from "@/contexts/NatsContext";
import { createInbox, Msg } from "@nats-io/nats-core";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { NatsStyles } from "@/constants/NatsStyles";
import { Button } from "react-native";

export type MsgEvent = {
  id: number;
  msg: Msg;
};

function Msgs({ msgs }: { msgs: MsgEvent[] }) {
  const list = msgs?.map((d) => (
    <ThemedText key={d.id} style={NatsStyles.code}>
      {d.id}&nbsp; {d.msg.subject}
    </ThemedText>
  ));

  if (!list) {
    return <ThemedView style={NatsStyles.codebox}></ThemedView>;
  }
  return <ThemedView style={NatsStyles.codebox}>{list}</ThemedView>;
}

export default function Nats() {
  const { nc, ncErr, url } = useNATS();
  const [status, setStatus] = useState("");
  const [messages, setMessages] = useState<MsgEvent[] | null>();
  const [err, setErr] = useState<Error | null>(null);
  const [inbox, setInbox] = useState(() => {
    let inbox = createInbox("hello");
    inbox = inbox.slice(0, inbox.length - 1);
    return inbox;
  });

  let a: MsgEvent[] = [];

  let i = 1;

  function callback(err: Error | null, msg: Msg) {
    if (err) {
      console.log(err);
      setErr(err);
      return;
    } else {
      const m = {
        id: i++,
        msg: msg,
      };
      a.push(m);
      a = a.slice(-5);
      setMessages(a.slice());
    }
  }

  useEffect(() => {
    if (nc) {
      setStatus(`connected to ${nc.getServer()}`);
      (async () => {
        nc.closed().then(() => {
          setStatus("NATS connection closed - reload the page");
        });
        for await (const s of nc.status()) {
          switch (s.type) {
            case "disconnect":
              setStatus(`disconnected from ${nc.getServer()}`);
              break;
            case "reconnect":
              setStatus(`connected to ${nc.getServer()}`);
              break;
          }
        }
      })();

      nc.subscribe(inbox, { callback });
    }
  }, [nc, status]);

  function pub() {
    nc?.publish(inbox, "Hello from React Native");
  }

  if (ncErr) {
    return (
      <ThemedView>
        <ThemedText type="subtitle">Error Connecting to NATS</ThemedText>
        <ThemedText>{ncErr.message}</ThemedText>
      </ThemedView>
    );
  }

  if (!nc) {
    return (
      <ThemedView>
        <ThemedText type="subtitle">Connecting To NATS...</ThemedText>
      </ThemedView>
    );
  }
  return (
    <ThemedView style={{ marginBottom: 30 }}>
      <ThemedText style={NatsStyles.lead}>
        This is a trivial NATS React Native Application that hints on how you
        can integrate a NATS connection to your application based on the react
        native generated example.
      </ThemedText>
      <ThemedText style={NatsStyles.p}>
        The connection created a connection to {url} and has the current status:
        {" "}
        {status}
      </ThemedText>

      <ThemedText style={NatsStyles.p}>
        The application is subscribed to '{inbox}', and it is receiving all
        messages published to the server on that subject. The application is
        prints the subject the message was received on. If nothing is printing,
        connect to the server at {url}{"  "}
        and publish a message with a tool such as 'nats' cli or by clicking the
        button below to publish a random message on '{inbox}'.
      </ThemedText>

      <Msgs msgs={messages ?? []} />
      <Button title="Publish Message" onPress={pub} />
      <ThemedText type="subtitle">{err?.message}</ThemedText>
    </ThemedView>
  );
}
