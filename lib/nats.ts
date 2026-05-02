import {
  type NatsConnection,
  wsconnect,
} from "@nats-io/nats-core";
import { type KV, Kvm } from "@nats-io/kv";
import { type ObjectStore, Objm } from "@nats-io/obj";

// RN's Hermes runtime doesn't expose Web Crypto's subtle API. Objm.create
// guards on `crypto.subtle.digest` existence (objectstore.ts:140) before
// creating buckets — even though the actual hashing uses js-sha256. A stub
// satisfies the precondition so create() can proceed on RN; the stub digest
// is never actually invoked.
const g = globalThis as {
  crypto?: { subtle?: { digest?: unknown } };
};
const stubSubtle = { digest: async () => new ArrayBuffer(32) };
if (typeof g.crypto?.subtle?.digest !== "function") {
  if (g.crypto) {
    try {
      (g.crypto as { subtle: typeof stubSubtle }).subtle = {
        ...(g.crypto.subtle ?? {}),
        ...stubSubtle,
      };
    } catch {
      // crypto is read-only; ObjectStore.create will reject with a clear error.
    }
  } else {
    try {
      Object.defineProperty(globalThis, "crypto", {
        value: { subtle: stubSubtle },
        configurable: true,
        writable: true,
      });
    } catch {
      // nothing else we can do.
    }
  }
}

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
