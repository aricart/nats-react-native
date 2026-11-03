# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

This project adds `@nats-io/nats-core`, `@nats-io/kv`, and `@nats-io/obj`,
which provide the basic API for a NATS core client and access to JetStream
KV and ObjectStore. It connects to `wss://demo.nats.io:8443`.

## Pattern

NATS connections, KV buckets, and ObjectStores are async resources. Modern
React already has a primitive for that: Suspense + the `use()` hook.
Components don't manage `nc | undefined` state, don't `useEffect` to
connect, don't lift errors into provider state.

- `src/lib/nats.ts` — module-scope singleton promises for the connection,
  KV, and ObjectStore. Cached on first call, shared by every component.
- `src/components/nats.tsx` / `kv.tsx` / `obj.tsx` — call `use(natsConn())`,
  `use(natsKv())`, `use(natsObj())` and get a ready handle synchronously.
  `useEffect` only runs subscription/watch lifecycles.
- `src/components/error-boundary.tsx` — small class component (no extra
  dependency).
- `src/app/index.tsx` — the generated home screen, wrapping the three
  components in `<Suspense>` + `<ErrorBoundary>`. The Suspense fallback shows
  while connecting; the ErrorBoundary catches connection failures.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **src/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **example** directory and create a blank **src/app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
