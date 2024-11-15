import React, { createContext, useContext, useEffect, useState } from "react";
import { NatsConnection } from "@nats-io/nats-core";
import { wsconnect } from "@nats-io/nats-core";

export type NatsConnectionContext = {
  nc: NatsConnection | undefined;
  ncErr: Error | null;
  url: string | undefined;
};

//@ts-ignore: not an error
export const NatsContext = createContext(); // Create the context with an initial value

export function useNATS(): NatsConnectionContext {
  return useContext(NatsContext) as NatsConnectionContext;
}

export function NatsProvider(props: any) {
  const [nc, setNatsConnection] = useState<NatsConnection>();
  const [ncErr, setNatsConnectionError] = useState<Error | null>(null);
  const value = {
    nc: nc,
    url: props.url,
    ncErr: ncErr,
  };

  useEffect(() => {
    if (props.url && nc === undefined) {
      wsconnect({ servers: [props.url] })
        .then((c) => {
          setNatsConnection(c);
        })
        .catch((err) => {
          setNatsConnectionError(err);
        });
    }
    return () => {
      if (nc) {
        // close the connection if we are unmounted
        nc.close().then(() => {
          console.log("closed nats connection");
        }).catch();
      }
    };
  });

  return (
    <NatsContext.Provider value={value}>
      {props.children}
    </NatsContext.Provider>
  );
}

export default NatsContext;
