import {
  type NatsConnection,
  wsconnect,
} from "@nats-io/nats-core";
import { type KV, Kvm } from "@nats-io/kv";
import { type ObjectStore, Objm } from "@nats-io/obj";

export const NATS_URL = "wss://demo.nats.io:8443";

// React 19 `use()` requires a stable promise identity across renders, so
// these caches must NOT be reset mid-flight on rejection. Failures surface
// to the ErrorBoundary; user reloads to retry.

let ncP: Promise<NatsConnection> | null = null;
export function natsConn(): Promise<NatsConnection> {
  return ncP ??= wsconnect({ servers: [NATS_URL] });
}

let kvP: Promise<KV> | null = null;
export function natsKv(): Promise<KV> {
  return kvP ??= natsConn().then((nc) =>
    new Kvm(nc).create("my_react_kv_example")
  );
}

let objP: Promise<ObjectStore> | null = null;
export function natsObj(): Promise<ObjectStore> {
  return objP ??= natsConn().then((nc) =>
    new Objm(nc).create("my_react_obj_example")
  );
}
